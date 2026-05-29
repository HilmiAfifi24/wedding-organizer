import type {
  AdminDashboardOverviewDTO,
  DashboardKpiSummaryDTO,
  DashboardPendingActionDTO,
  DashboardQuickActionDTO,
  DashboardTimeRange,
} from "@wo/shared-types";

import {
  hasAuditHistoryPermission,
  hasViewPermission,
  resolveDashboardDateRange,
  type DashboardPermissionMap,
} from "@/core/domain/entities/dashboard-overview";
import type { DashboardOverviewRepository } from "@/core/domain/repositories";

const quickActionsCatalog: Array<DashboardQuickActionDTO & { permissionKey: keyof DashboardPermissionMap }> = [
  {
    key: "users",
    title: "Manage Users",
    description: "Lihat, suspend, dan kelola user platform.",
    href: "/users",
    permissionKey: "users",
  },
  {
    key: "vendors",
    title: "Manage Vendors",
    description: "Review verifikasi vendor dan status operasional.",
    href: "/vendors",
    permissionKey: "vendors",
  },
  {
    key: "bookings",
    title: "Manage Bookings",
    description: "Pantau lifecycle booking dari pending sampai selesai.",
    href: "/bookings",
    permissionKey: "bookings",
  },
  {
    key: "payments",
    title: "Manage Payments",
    description: "Monitor bukti pembayaran dan override bila diperlukan.",
    href: "/payments",
    permissionKey: "payments",
  },
  {
    key: "reviews",
    title: "Moderate Reviews",
    description: "Tangani review yang perlu dimoderasi.",
    href: "/reviews",
    permissionKey: "reviews",
  },
  {
    key: "audit-logs",
    title: "View Audit Logs",
    description: "Buka histori aktivitas admin terbaru.",
    href: "/audit-logs",
    permissionKey: "auditLogs",
  },
];

export class DashboardAnalyticsService {
  constructor(private readonly repository: DashboardOverviewRepository) {}

  private assertDashboardPermission(permissions: DashboardPermissionMap) {
    if (!hasViewPermission(permissions.dashboard)) {
      throw new Error("Forbidden: no permission to access dashboard overview");
    }
  }

  private buildVisibleQuickActions(permissions: DashboardPermissionMap) {
    return quickActionsCatalog.filter((item) => {
      if (item.permissionKey === "auditLogs") {
        return hasAuditHistoryPermission(permissions.auditLogs);
      }

      return hasViewPermission(permissions[item.permissionKey]);
    });
  }

  private buildVisibleKpis(
    permissions: DashboardPermissionMap,
    allKpis: DashboardKpiSummaryDTO[]
  ): DashboardKpiSummaryDTO[] {
    const allowedKeys = new Set<string>();

    if (hasViewPermission(permissions.users)) {
      allowedKeys.add("total-users");
    }

    if (hasViewPermission(permissions.vendors)) {
      allowedKeys.add("total-vendors");
      allowedKeys.add("pending-vendors");
      allowedKeys.add("active-vendors");
      allowedKeys.add("suspended-vendors");
    }

    if (hasViewPermission(permissions.bookings)) {
      allowedKeys.add("total-bookings");
      allowedKeys.add("completed-bookings");
      allowedKeys.add("cancelled-bookings");
    }

    if (hasViewPermission(permissions.payments)) {
      allowedKeys.add("pending-payments");
    }

    if (hasViewPermission(permissions.reviews)) {
      allowedKeys.add("total-reviews");
    }

    return allKpis.filter((item) => allowedKeys.has(item.key));
  }

  private buildPendingActions(input: {
    permissions: DashboardPermissionMap;
    pendingVendorCount?: number;
    pendingPaymentCount?: number;
    bookingsAttentionCount?: number;
    hiddenReviewCount?: number;
  }): DashboardPendingActionDTO[] {
    const actions: DashboardPendingActionDTO[] = [];

    if (hasViewPermission(input.permissions.vendors) && (input.pendingVendorCount ?? 0) > 0) {
      actions.push({
        key: "pending-vendors",
        title: "Vendor menunggu verifikasi",
        description: "Vendor baru perlu ditinjau sebelum tampil di aplikasi user.",
        count: input.pendingVendorCount ?? 0,
        href: "/vendors",
        ctaLabel: "Tinjau vendor",
      });
    }

    if (hasViewPermission(input.permissions.payments) && (input.pendingPaymentCount ?? 0) > 0) {
      actions.push({
        key: "pending-payments",
        title: "Pembayaran menunggu verifikasi",
        description: "Bukti pembayaran pending perlu dipantau atau di-override bila dibutuhkan.",
        count: input.pendingPaymentCount ?? 0,
        href: "/payments",
        ctaLabel: "Buka pembayaran",
      });
    }

    if (hasViewPermission(input.permissions.bookings) && (input.bookingsAttentionCount ?? 0) > 0) {
      actions.push({
        key: "bookings-attention",
        title: "Booking perlu perhatian",
        description: "Booking pending dan pending payment perlu tindak lanjut operasional.",
        count: input.bookingsAttentionCount ?? 0,
        href: "/bookings",
        ctaLabel: "Buka booking",
      });
    }

    if (hasViewPermission(input.permissions.reviews) && (input.hiddenReviewCount ?? 0) > 0) {
      actions.push({
        key: "reviews-moderation",
        title: "Review perlu moderasi lanjutan",
        description: "Ada review tersembunyi yang sebaiknya ditinjau kembali oleh admin.",
        count: input.hiddenReviewCount ?? 0,
        href: "/reviews",
        ctaLabel: "Buka moderasi",
      });
    }

    return actions;
  }

  async getOverview(actorId: string, timeRange: DashboardTimeRange): Promise<AdminDashboardOverviewDTO> {
    const permissions = await this.repository.getActorDashboardPermissions(actorId);
    this.assertDashboardPermission(permissions);

    const dateRange = resolveDashboardDateRange(timeRange);

    const shouldLoadUsers = hasViewPermission(permissions.users);
    const shouldLoadVendors = hasViewPermission(permissions.vendors);
    const shouldLoadBookings = hasViewPermission(permissions.bookings);
    const shouldLoadPayments = hasViewPermission(permissions.payments);
    const shouldLoadReviews = hasViewPermission(permissions.reviews);
    const shouldLoadRecentActivities = hasAuditHistoryPermission(permissions.auditLogs);

    const [allKpis, bookings, vendors, payments, reviews, recentActivities] = await Promise.all([
      this.repository.getKpiSummary(),
      shouldLoadBookings
        ? this.repository
            .getBookingsOverview(dateRange)
            .then((section) => ({ ...section, range: timeRange }))
        : Promise.resolve(null),
      shouldLoadVendors ? this.repository.getVendorsOverview() : Promise.resolve(null),
      shouldLoadPayments
        ? this.repository
            .getPaymentsOverview(dateRange)
            .then((section) => ({ ...section, range: timeRange }))
        : Promise.resolve(null),
      shouldLoadReviews
        ? this.repository
            .getReviewsOverview(dateRange)
            .then((section) => ({ ...section, range: timeRange }))
        : Promise.resolve(null),
      shouldLoadRecentActivities ? this.repository.listRecentActivities(10) : Promise.resolve(null),
    ]);

    const visibleKpis = this.buildVisibleKpis(permissions, allKpis);

    const pendingVendorCount =
      vendors?.statuses.find((item) => item.status === "pending_verification")?.count ?? 0;
    const pendingPaymentCount =
      payments?.statuses.find((item) => item.status === "PENDING")?.count ?? 0;
    const bookingsAttentionCount =
      (bookings?.statuses.find((item) => item.status === "PENDING")?.count ?? 0) +
      (bookings?.statuses.find((item) => item.status === "PENDING_PAYMENT")?.count ?? 0);
    const hiddenReviewCount =
      reviews?.statuses.find((item) => item.status === "HIDDEN")?.count ?? 0;

    return {
      timeRange,
      permissions: {
        dashboard: hasViewPermission(permissions.dashboard),
        users: shouldLoadUsers,
        vendors: shouldLoadVendors,
        bookings: shouldLoadBookings,
        payments: shouldLoadPayments,
        reviews: shouldLoadReviews,
        auditLogs: shouldLoadRecentActivities,
      },
      kpis: visibleKpis,
      bookings,
      vendors,
      payments,
      reviews,
      recentActivities,
      pendingActions: this.buildPendingActions({
        permissions,
        pendingVendorCount,
        pendingPaymentCount,
        bookingsAttentionCount,
        hiddenReviewCount,
      }),
      quickActions: this.buildVisibleQuickActions(permissions),
    };
  }

  async getBookingsOverview(actorId: string, timeRange: DashboardTimeRange) {
    const permissions = await this.repository.getActorDashboardPermissions(actorId);
    this.assertDashboardPermission(permissions);

    if (!hasViewPermission(permissions.bookings)) {
      throw new Error("Forbidden: no permission to view booking overview");
    }

    return this.repository
      .getBookingsOverview(resolveDashboardDateRange(timeRange))
      .then((section) => ({ ...section, range: timeRange }));
  }

  async getVendorsOverview(actorId: string) {
    const permissions = await this.repository.getActorDashboardPermissions(actorId);
    this.assertDashboardPermission(permissions);

    if (!hasViewPermission(permissions.vendors)) {
      throw new Error("Forbidden: no permission to view vendor overview");
    }

    return this.repository.getVendorsOverview();
  }

  async getPaymentsOverview(actorId: string, timeRange: DashboardTimeRange) {
    const permissions = await this.repository.getActorDashboardPermissions(actorId);
    this.assertDashboardPermission(permissions);

    if (!hasViewPermission(permissions.payments)) {
      throw new Error("Forbidden: no permission to view payment overview");
    }

    return this.repository
      .getPaymentsOverview(resolveDashboardDateRange(timeRange))
      .then((section) => ({ ...section, range: timeRange }));
  }

  async getReviewsOverview(actorId: string, timeRange: DashboardTimeRange) {
    const permissions = await this.repository.getActorDashboardPermissions(actorId);
    this.assertDashboardPermission(permissions);

    if (!hasViewPermission(permissions.reviews)) {
      throw new Error("Forbidden: no permission to view review overview");
    }

    return this.repository
      .getReviewsOverview(resolveDashboardDateRange(timeRange))
      .then((section) => ({ ...section, range: timeRange }));
  }

  async getRecentActivities(actorId: string) {
    const permissions = await this.repository.getActorDashboardPermissions(actorId);
    this.assertDashboardPermission(permissions);

    if (!hasAuditHistoryPermission(permissions.auditLogs)) {
      throw new Error("Forbidden: no permission to view recent activities");
    }

    return this.repository.listRecentActivities(10);
  }
}
