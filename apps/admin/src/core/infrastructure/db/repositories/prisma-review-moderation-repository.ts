import "server-only";

import type {
  AdminReviewDetailDTO,
  AdminReviewListItemDTO,
  AdminReviewsQuery,
  AuditLogDTO,
  AuditModule,
  BookingStatus,
  CreateAuditLogInput,
  ReviewModerationAction,
  ReviewModerationHistoryDTO,
  Role,
} from "@wo/shared-types";

import { sanitizeAuditValue } from "@/core/domain/entities/audit-log-dashboard";
import {
  mapPrismaReviewStatusToDto,
  mapPrismaVendorStatusToDto,
  type ReviewModerationPermissionFlags,
} from "@/core/domain/entities/review-moderation";
import type { ReviewModerationRepository } from "@/core/domain/repositories";

import { prisma } from "../prisma";

type PrismaReviewListRecord = {
  id: string;
  bookingId: string;
  rating: number;
  comment: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  vendorId: string;
  booking: {
    status: string;
  };
  user: {
    name: string | null;
    email: string;
  };
  vendor: {
    name: string;
  };
};

const mapBookingStatus = (status: string) => status as BookingStatus;

const mapReviewListItem = (review: PrismaReviewListRecord): AdminReviewListItemDTO => ({
  id: review.id,
  bookingId: review.bookingId,
  rating: review.rating,
  comment: review.comment,
  status: mapPrismaReviewStatusToDto(review.status),
  createdAt: review.createdAt,
  updatedAt: review.updatedAt,
  reviewerId: review.userId,
  reviewerName: review.user.name,
  reviewerEmail: review.user.email,
  vendorId: review.vendorId,
  vendorName: review.vendor.name,
  bookingStatus: mapBookingStatus(review.booking.status),
});

const toJsonValue = (value: unknown) => {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value));
};

export class PrismaReviewModerationRepository implements ReviewModerationRepository {
  async getActorPermissionByMenuCode(
    actorId: string,
    menuCode: string
  ): Promise<ReviewModerationPermissionFlags | null> {
    const user = await prisma.user.findUnique({
      where: { id: actorId },
      select: {
        accessProfile: {
          select: {
            permissions: {
              where: {
                accessMenu: {
                  code: menuCode,
                },
              },
              select: {
                canView: true,
                canInsert: true,
                canUpdate: true,
                canUpsert: true,
                canDelete: true,
                canHistory: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    const permission = user?.accessProfile?.permissions?.[0];
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
  }

  async listReviews(
    query: Required<Pick<AdminReviewsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">> &
      Omit<AdminReviewsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">
  ): Promise<{ items: AdminReviewListItemDTO[]; totalItems: number }> {
    const skip = (query.page - 1) * query.pageSize;

    const where = {
      AND: [
        query.search
          ? {
              OR: [
                { comment: { contains: query.search, mode: "insensitive" as const } },
                { user: { name: { contains: query.search, mode: "insensitive" as const } } },
                { vendor: { name: { contains: query.search, mode: "insensitive" as const } } },
              ],
            }
          : {},
        query.status ? { status: query.status } : {},
        typeof query.rating === "number" ? { rating: query.rating } : {},
        query.vendor
          ? { vendor: { name: { contains: query.vendor, mode: "insensitive" as const } } }
          : {},
        query.createdFrom || query.createdTo
          ? {
              createdAt: {
                ...(query.createdFrom ? { gte: query.createdFrom } : {}),
                ...(query.createdTo ? { lte: query.createdTo } : {}),
              },
            }
          : {},
      ],
    };

    const orderBy =
      query.sortBy === "status"
        ? ({ status: query.sortDirection } as const)
        : ({ [query.sortBy]: query.sortDirection } as Record<string, "asc" | "desc">);

    const [reviews, totalItems] = await prisma.$transaction([
      prisma.review.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy,
        include: {
          booking: {
            select: {
              status: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          vendor: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return {
      items: reviews.map((review) =>
        mapReviewListItem({
          ...review,
          status: review.status,
        })
      ),
      totalItems,
    };
  }

  async getReviewById(reviewId: string): Promise<AdminReviewDetailDTO | null> {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        booking: {
          select: {
            id: true,
            bookedAt: true,
            status: true,
            notes: true,
            serviceId: true,
            service: {
              select: {
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
            status: true,
            owner: {
              select: {
                name: true,
                email: true,
              },
            },
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        hiddenBy: {
          select: {
            name: true,
          },
        },
        deletedBy: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!review) {
      return null;
    }

    return {
      ...mapReviewListItem({
        id: review.id,
        bookingId: review.bookingId,
        rating: review.rating,
        comment: review.comment,
        status: review.status,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        userId: review.userId,
        vendorId: review.vendorId,
        booking: {
          status: review.booking.status,
        },
        user: {
          name: review.user.name,
          email: review.user.email,
        },
        vendor: {
          name: review.vendor.name,
        },
      }),
      moderationReason: review.moderationReason,
      hiddenAt: review.hiddenAt,
      hiddenById: review.hiddenById,
      hiddenByName: review.hiddenBy?.name ?? null,
      deletedAt: review.deletedAt,
      deletedById: review.deletedById,
      deletedByName: review.deletedBy?.name ?? null,
      booking: {
        id: review.booking.id,
        bookedAt: review.booking.bookedAt,
        status: mapBookingStatus(review.booking.status),
        notes: review.booking.notes,
        serviceId: review.booking.serviceId,
        serviceName: review.booking.service?.name ?? null,
      },
      user: {
        id: review.user.id,
        name: review.user.name,
        email: review.user.email,
        role: review.user.role as Role,
      },
      vendor: {
        id: review.vendor.id,
        name: review.vendor.name,
        status: mapPrismaVendorStatusToDto(review.vendor.status),
        ownerName: review.vendor.owner.name,
        ownerEmail: review.vendor.owner.email,
        categoryName: review.vendor.category?.name ?? null,
      },
    };
  }

  async getReviewHistory(reviewId: string): Promise<ReviewModerationHistoryDTO[]> {
    const items = await prisma.reviewModerationHistory.findMany({
      where: { reviewId },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        actor: {
          select: {
            name: true,
          },
        },
      },
    });

    return items.map((item) => ({
      id: item.id,
      reviewId: item.reviewId,
      action: item.action as ReviewModerationAction,
      reason: item.reason,
      actorId: item.actorId,
      actorName: item.actor?.name ?? null,
      beforeData: item.beforeData,
      afterData: item.afterData,
      createdAt: item.createdAt,
    }));
  }

  async hideReview(input: {
    reviewId: string;
    actorId: string;
    reason: string;
  }): Promise<AdminReviewDetailDTO> {
    await prisma.review.update({
      where: { id: input.reviewId },
      data: {
        status: "HIDDEN",
        hiddenAt: new Date(),
        hiddenById: input.actorId,
        moderationReason: input.reason,
      },
    });

    const review = await this.getReviewById(input.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    return review;
  }

  async unhideReview(input: {
    reviewId: string;
    actorId: string;
    reason?: string;
  }): Promise<AdminReviewDetailDTO> {
    await prisma.review.update({
      where: { id: input.reviewId },
      data: {
        status: "VISIBLE",
        hiddenAt: null,
        hiddenById: null,
        moderationReason: input.reason ?? null,
      },
    });

    const review = await this.getReviewById(input.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    return review;
  }

  async softDeleteReview(input: {
    reviewId: string;
    actorId: string;
    reason: string;
  }): Promise<AdminReviewDetailDTO> {
    await prisma.review.update({
      where: { id: input.reviewId },
      data: {
        status: "DELETED",
        deletedAt: new Date(),
        deletedById: input.actorId,
        moderationReason: input.reason,
      },
    });

    const review = await this.getReviewById(input.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    return review;
  }

  async createModerationHistory(input: {
    reviewId: string;
    action: ReviewModerationAction;
    reason?: string;
    actorId: string;
    beforeData?: unknown;
    afterData?: unknown;
  }): Promise<ReviewModerationHistoryDTO> {
    const item = await prisma.reviewModerationHistory.create({
      data: {
        reviewId: input.reviewId,
        action: input.action,
        reason: input.reason,
        actorId: input.actorId,
        beforeData: toJsonValue(input.beforeData),
        afterData: toJsonValue(input.afterData),
      },
      include: {
        actor: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      id: item.id,
      reviewId: item.reviewId,
      action: item.action as ReviewModerationAction,
      reason: item.reason,
      actorId: item.actorId,
      actorName: item.actor?.name ?? null,
      beforeData: item.beforeData,
      afterData: item.afterData,
      createdAt: item.createdAt,
    };
  }

  async createAuditLog(data: CreateAuditLogInput): Promise<AuditLogDTO> {
    const auditLog = await prisma.auditLog.create({
      data: {
        actorId: data.actorId,
        module: data.module,
        action: data.action,
        targetId: data.targetId,
        beforeData: toJsonValue(sanitizeAuditValue(data.beforeData)),
        afterData: toJsonValue(sanitizeAuditValue(data.afterData)),
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
      },
    });

    return {
      id: auditLog.id,
      actorId: auditLog.actorId,
      module: auditLog.module as AuditModule,
      action: auditLog.action,
      targetId: auditLog.targetId,
      beforeData: auditLog.beforeData,
      afterData: auditLog.afterData,
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      createdAt: auditLog.createdAt,
    };
  }
}
