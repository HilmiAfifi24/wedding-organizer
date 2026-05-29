import "server-only";

import type {
  AdminDashboardBookingsOverviewDTO,
  AdminDashboardPaymentsOverviewDTO,
  AdminDashboardReviewsOverviewDTO,
  AdminDashboardVendorsOverviewDTO,
  AuditModule,
  DashboardKpiSummaryDTO,
  DashboardRecentActivityDTO,
  DashboardStatusMetricDTO,
  PaymentProofStatus,
  ReviewStatus,
  VendorStatus,
} from "@wo/shared-types";
import { BookingStatus, DashboardTimeRange } from "@wo/shared-types";

import {
  BOOKING_STATUS_ORDER,
  DASHBOARD_MENU_CODES,
  PAYMENT_STATUS_ORDER,
  REVIEW_STATUS_ORDER,
  VENDOR_STATUS_ORDER,
  type DashboardDateRange,
  type DashboardPermissionFlags,
  type DashboardPermissionMap,
} from "@/core/domain/entities/dashboard-overview";
import { inferAuditTargetPath } from "@/core/domain/entities/audit-log-dashboard";
import type { DashboardOverviewRepository } from "@/core/domain/repositories";

import { prisma } from "../prisma";

const bookingStatusLabels: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "Pending",
  [BookingStatus.PENDING_PAYMENT]: "Pending Payment",
  [BookingStatus.CONFIRMED]: "Confirmed",
  [BookingStatus.COMPLETED]: "Completed",
  [BookingStatus.CANCELLED]: "Cancelled",
  [BookingStatus.REJECTED]: "Rejected",
};

const vendorStatusLabels: Record<VendorStatus, string> = {
  pending_verification: "Pending Verification",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
};

const paymentStatusLabels: Record<PaymentProofStatus, string> = {
  PENDING: "Pending Verification",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
};

const reviewStatusLabels: Record<ReviewStatus, string> = {
  VISIBLE: "Visible",
  HIDDEN: "Hidden",
  DELETED: "Deleted",
};

const buildPermissionFlags = (
  permission:
    | {
        canView: boolean;
        canInsert: boolean;
        canUpdate: boolean;
        canUpsert: boolean;
        canDelete: boolean;
        canHistory: boolean;
      }
    | undefined
): DashboardPermissionFlags | null => {
  if (!permission) {
    return null;
  }

  return {
    canView: permission.canView,
    canInsert: permission.canInsert,
    canUpdate: permission.canUpdate,
    canUpsert: permission.canUpsert,
    canDelete: permission.canDelete,
    canHistory: permission.canHistory,
  };
};

const mapMetric = <TStatus extends string>(
  order: readonly TStatus[],
  labels: Record<TStatus, string>,
  counts: Map<string, number>
): DashboardStatusMetricDTO[] =>
  order.map((status) => ({
    status,
    label: labels[status],
    count: counts.get(status) ?? 0,
  }));

type StatusCountRow = {
  status: string;
  count: number;
};

type VendorGroupRow = {
  vendorId: string;
  count: number;
};

type VendorRatingGroupRow = {
  vendorId: string;
  count: number;
  averageRating: number | null;
};

type RatingCountRow = {
  rating: number;
  count: number;
};

export class PrismaDashboardOverviewRepository implements DashboardOverviewRepository {
  async getActorDashboardPermissions(actorId: string): Promise<DashboardPermissionMap> {
    const codes = Object.values(DASHBOARD_MENU_CODES);
    const user = await prisma.user.findUnique({
      where: { id: actorId },
      select: {
        accessProfile: {
          select: {
            permissions: {
              where: {
                accessMenu: {
                  code: {
                    in: codes,
                  },
                },
              },
              select: {
                canView: true,
                canInsert: true,
                canUpdate: true,
                canUpsert: true,
                canDelete: true,
                canHistory: true,
                accessMenu: {
                  select: {
                    code: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const permissionByCode = new Map(
      (user?.accessProfile?.permissions ?? []).map((permission) => [permission.accessMenu.code, permission])
    );

    return {
      dashboard: buildPermissionFlags(permissionByCode.get(DASHBOARD_MENU_CODES.dashboard)),
      users: buildPermissionFlags(permissionByCode.get(DASHBOARD_MENU_CODES.users)),
      vendors: buildPermissionFlags(permissionByCode.get(DASHBOARD_MENU_CODES.vendors)),
      bookings: buildPermissionFlags(permissionByCode.get(DASHBOARD_MENU_CODES.bookings)),
      payments: buildPermissionFlags(permissionByCode.get(DASHBOARD_MENU_CODES.payments)),
      reviews: buildPermissionFlags(permissionByCode.get(DASHBOARD_MENU_CODES.reviews)),
      auditLogs: buildPermissionFlags(permissionByCode.get(DASHBOARD_MENU_CODES.auditLogs)),
    };
  }

  async getKpiSummary(): Promise<DashboardKpiSummaryDTO[]> {
    const [totalUsers, totalVendors, totalBookings, pendingPayments, totalReviews] =
      await Promise.all([
      prisma.user.count({
        where: {
          role: "USER",
          deletedAt: null,
        },
      }),
      prisma.vendor.count({
        where: {
          deletedAt: null,
        },
      }),
      prisma.booking.count(),
      prisma.paymentProof.count({
        where: {
          status: "PENDING",
        },
      }),
      prisma.review.count(),
    ]);

    const [vendorStatusCounts, bookingStatusCounts] = await Promise.all([
      prisma.$queryRaw<StatusCountRow[]>`
        SELECT LOWER(status::text) AS status, COUNT(*)::int AS count
        FROM "Vendor"
        WHERE "deletedAt" IS NULL
        GROUP BY status
        ORDER BY status ASC
      `,
      prisma.$queryRaw<StatusCountRow[]>`
        SELECT status::text AS status, COUNT(*)::int AS count
        FROM "Booking"
        GROUP BY status
        ORDER BY status ASC
      `,
    ]);

    const vendorCounts = new Map(
      vendorStatusCounts.map((item) => [item.status.toLowerCase(), item.count])
    );
    const bookingCounts = new Map(bookingStatusCounts.map((item) => [item.status, item.count]));

    return [
      {
        key: "total-users",
        title: "Total Users",
        count: totalUsers,
        href: "/users",
        trendPercentage: null,
      },
      {
        key: "total-vendors",
        title: "Total Vendors",
        count: totalVendors,
        href: "/vendors",
        trendPercentage: null,
      },
      {
        key: "pending-vendors",
        title: "Pending Vendor Verification",
        count: vendorCounts.get("pending_verification") ?? 0,
        href: "/vendors",
        trendPercentage: null,
      },
      {
        key: "active-vendors",
        title: "Active Vendors",
        count: vendorCounts.get("approved") ?? 0,
        href: "/vendors",
        trendPercentage: null,
      },
      {
        key: "suspended-vendors",
        title: "Suspended Vendors",
        count: vendorCounts.get("suspended") ?? 0,
        href: "/vendors",
        trendPercentage: null,
      },
      {
        key: "total-bookings",
        title: "Total Bookings",
        count: totalBookings,
        href: "/bookings",
        trendPercentage: null,
      },
      {
        key: "pending-payments",
        title: "Pending Payments",
        count: pendingPayments,
        href: "/payments",
        trendPercentage: null,
      },
      {
        key: "completed-bookings",
        title: "Completed Bookings",
        count: bookingCounts.get("COMPLETED") ?? 0,
        href: "/bookings",
        trendPercentage: null,
      },
      {
        key: "cancelled-bookings",
        title: "Cancelled Bookings",
        count: bookingCounts.get("CANCELLED") ?? 0,
        href: "/bookings",
        trendPercentage: null,
      },
      {
        key: "total-reviews",
        title: "Total Reviews",
        count: totalReviews,
        href: "/reviews",
        trendPercentage: null,
      },
    ];
  }

  async getBookingsOverview(range: DashboardDateRange): Promise<AdminDashboardBookingsOverviewDTO> {
    const grouped = await prisma.$queryRaw<StatusCountRow[]>`
      SELECT status::text AS status, COUNT(*)::int AS count
      FROM "Booking"
      WHERE "bookedAt" >= ${range.from} AND "bookedAt" <= ${range.to}
      GROUP BY status
      ORDER BY status ASC
    `;

    const counts = new Map(grouped.map((item) => [item.status, item.count]));
    const statuses = mapMetric(BOOKING_STATUS_ORDER, bookingStatusLabels, counts);

    return {
      range: DashboardTimeRange.LAST_30_DAYS,
      total: statuses.reduce((sum, item) => sum + item.count, 0),
      statuses,
    };
  }

  async getVendorsOverview(): Promise<AdminDashboardVendorsOverviewDTO> {
    const [groupedStatuses, topBookingGroups, topRatingGroups] = await Promise.all([
      prisma.$queryRaw<StatusCountRow[]>`
        SELECT LOWER(status::text) AS status, COUNT(*)::int AS count
        FROM "Vendor"
        WHERE "deletedAt" IS NULL
        GROUP BY status
        ORDER BY status ASC
      `,
      prisma.$queryRaw<VendorGroupRow[]>`
        SELECT "vendorId", COUNT(*)::int AS count
        FROM "Booking"
        GROUP BY "vendorId"
        ORDER BY count DESC
        LIMIT 5
      `,
      prisma.$queryRaw<VendorRatingGroupRow[]>`
        SELECT "vendorId", COUNT(*)::int AS count, ROUND(AVG(rating)::numeric, 1)::float AS "averageRating"
        FROM "Review"
        WHERE status = 'VISIBLE' AND "deletedAt" IS NULL
        GROUP BY "vendorId"
        ORDER BY AVG(rating) DESC
        LIMIT 5
      `,
    ]);

    const vendorIds = Array.from(
      new Set([
        ...topBookingGroups.map((item) => item.vendorId),
        ...topRatingGroups.map((item) => item.vendorId),
      ])
    );

    const vendors = vendorIds.length
      ? await prisma.vendor.findMany({
          where: {
            id: {
              in: vendorIds,
            },
          },
          select: {
            id: true,
            name: true,
          },
        })
      : [];

    const vendorNameById = new Map(vendors.map((vendor) => [vendor.id, vendor.name]));
    const statusCounts = new Map(
      groupedStatuses.map((item) => [item.status.toLowerCase(), item.count])
    );
    const statuses = mapMetric(VENDOR_STATUS_ORDER, vendorStatusLabels, statusCounts);

    return {
      total: statuses.reduce((sum, item) => sum + item.count, 0),
      statuses,
      topByBookings: topBookingGroups.map((item) => ({
        vendorId: item.vendorId,
        vendorName: vendorNameById.get(item.vendorId) ?? "Vendor",
        metricValue: item.count,
        metricLabel: "bookings",
        href: `/vendors/${item.vendorId}`,
      })),
      topByRatings: topRatingGroups.map((item) => ({
        vendorId: item.vendorId,
        vendorName: vendorNameById.get(item.vendorId) ?? "Vendor",
        metricValue: Number((item.averageRating ?? 0).toFixed(1)),
        metricLabel: `${item.count} reviews`,
        href: `/vendors/${item.vendorId}`,
      })),
    };
  }

  async getPaymentsOverview(range: DashboardDateRange): Promise<AdminDashboardPaymentsOverviewDTO> {
    const grouped = await prisma.$queryRaw<StatusCountRow[]>`
      SELECT status::text AS status, COUNT(*)::int AS count
      FROM "PaymentProof"
      WHERE "createdAt" >= ${range.from} AND "createdAt" <= ${range.to}
      GROUP BY status
      ORDER BY status ASC
    `;

    const counts = new Map(grouped.map((item) => [item.status, item.count]));
    const statuses = mapMetric(PAYMENT_STATUS_ORDER, paymentStatusLabels, counts);

    return {
      range: DashboardTimeRange.LAST_30_DAYS,
      total: statuses.reduce((sum, item) => sum + item.count, 0),
      statuses,
    };
  }

  async getReviewsOverview(range: DashboardDateRange): Promise<AdminDashboardReviewsOverviewDTO> {
    const [groupedStatuses, groupedRatings, aggregate] = await Promise.all([
      prisma.$queryRaw<StatusCountRow[]>`
        SELECT status::text AS status, COUNT(*)::int AS count
        FROM "Review"
        WHERE "createdAt" >= ${range.from} AND "createdAt" <= ${range.to}
        GROUP BY status
        ORDER BY status ASC
      `,
      prisma.$queryRaw<RatingCountRow[]>`
        SELECT rating, COUNT(*)::int AS count
        FROM "Review"
        WHERE "createdAt" >= ${range.from} AND "createdAt" <= ${range.to}
        GROUP BY rating
        ORDER BY rating ASC
      `,
      prisma.review.aggregate({
        where: {
          createdAt: {
            gte: range.from,
            lte: range.to,
          },
        },
        _avg: {
          rating: true,
        },
        _count: {
          _all: true,
        },
      }),
    ]);

    const statusCounts = new Map(groupedStatuses.map((item) => [item.status, item.count]));
    const ratingCounts = new Map(groupedRatings.map((item) => [item.rating, item.count]));
    const statuses = mapMetric(REVIEW_STATUS_ORDER, reviewStatusLabels, statusCounts);

    return {
      range: DashboardTimeRange.LAST_30_DAYS,
      total: aggregate._count._all,
      averageRating: Number((aggregate._avg.rating ?? 0).toFixed(1)),
      statuses,
      ratingDistribution: [1, 2, 3, 4, 5].map((rating) => ({
        rating,
        count: ratingCounts.get(rating) ?? 0,
      })),
    };
  }

  async listRecentActivities(limit: number): Promise<DashboardRecentActivityDTO[]> {
    const items = await prisma.auditLog.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        actor: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return items.map((item) => ({
      id: item.id,
      actorName: item.actor.name,
      actorEmail: item.actor.email,
      action: item.action,
      module: item.module as AuditModule,
      targetId: item.targetId,
      createdAt: item.createdAt,
      detailPath: `/audit-logs/${item.id}`,
      targetPath: inferAuditTargetPath(item.module as AuditModule, item.targetId),
    }));
  }
}
