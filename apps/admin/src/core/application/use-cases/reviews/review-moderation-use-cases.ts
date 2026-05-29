import {
  AuditModule,
  ReviewModerationAction,
  ReviewStatus,
  type CreateAuditLogInput,
} from "@wo/shared-types";

import {
  REVIEW_MODERATION_MENU_CODE,
  type ReviewModerationPermissionFlags,
} from "@/core/domain/entities/review-moderation";
import type { ReviewModerationRepository } from "@/core/domain/repositories";

import type {
  ParsedReviewListQuery,
  ReviewDetailResponse,
  ReviewHistoryResponse,
  ReviewListResponse,
} from "../../dto/reviews/review-moderation-dto";

const assertPermission = (
  permission: ReviewModerationPermissionFlags | null,
  key: keyof ReviewModerationPermissionFlags,
  message: string
) => {
  if (!permission || !permission[key]) {
    throw new Error(message);
  }
};

const defaultSortBy: NonNullable<ParsedReviewListQuery["sortBy"]> = "createdAt";
const defaultSortDirection: NonNullable<ParsedReviewListQuery["sortDirection"]> = "desc";

const toPagedResult = (
  query: Pick<ParsedReviewListQuery, "page" | "pageSize">,
  totalItems: number,
  items: ReviewListResponse["items"]
): ReviewListResponse => ({
  items,
  page: query.page,
  pageSize: query.pageSize,
  totalItems,
  totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
});

const createAuditPayload = (
  actorId: string,
  action: string,
  targetId: string,
  beforeData: unknown,
  afterData: unknown
): CreateAuditLogInput => ({
  actorId,
  module: AuditModule.REVIEW_MODERATION,
  action,
  targetId,
  beforeData,
  afterData,
});

const requireModerationReason = (reason: string) => {
  const normalized = reason.trim();
  if (!normalized) {
    throw new Error("Moderation reason is required");
  }

  return normalized;
};

export class ListAdminReviewsUseCase {
  constructor(private readonly repository: ReviewModerationRepository) {}

  async execute(actorId: string, query: ParsedReviewListQuery): Promise<ReviewListResponse> {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      REVIEW_MODERATION_MENU_CODE
    );

    assertPermission(permission, "canView", "Forbidden: no permission to view reviews");

    const normalizedQuery: ParsedReviewListQuery = {
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
      status: query.status,
      rating: query.rating,
      vendor: query.vendor,
      createdFrom: query.createdFrom,
      createdTo: query.createdTo,
      sortBy: query.sortBy ?? defaultSortBy,
      sortDirection: query.sortDirection ?? defaultSortDirection,
    };

    const result = await this.repository.listReviews(normalizedQuery);
    return toPagedResult(normalizedQuery, result.totalItems, result.items);
  }
}

export class GetAdminReviewDetailUseCase {
  constructor(private readonly repository: ReviewModerationRepository) {}

  async execute(actorId: string, reviewId: string): Promise<ReviewDetailResponse> {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      REVIEW_MODERATION_MENU_CODE
    );

    assertPermission(permission, "canView", "Forbidden: no permission to view review detail");

    const review = await this.repository.getReviewById(reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    return review;
  }
}

export class GetAdminReviewHistoryUseCase {
  constructor(private readonly repository: ReviewModerationRepository) {}

  async execute(actorId: string, reviewId: string): Promise<ReviewHistoryResponse> {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      REVIEW_MODERATION_MENU_CODE
    );

    assertPermission(permission, "canHistory", "Forbidden: no permission to view moderation history");

    const review = await this.repository.getReviewById(reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    return this.repository.getReviewHistory(reviewId);
  }
}

export class HideReviewUseCase {
  constructor(private readonly repository: ReviewModerationRepository) {}

  async execute(actorId: string, reviewId: string, reason: string) {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      REVIEW_MODERATION_MENU_CODE
    );

    assertPermission(permission, "canUpdate", "Forbidden: no permission to hide review");

    const before = await this.repository.getReviewById(reviewId);
    if (!before) {
      throw new Error("Review not found");
    }

    if (before.booking.status !== "COMPLETED") {
      throw new Error("Only reviews from completed bookings are valid");
    }

    if (before.status === ReviewStatus.DELETED) {
      throw new Error("Deleted review cannot be hidden");
    }

    if (before.status === ReviewStatus.HIDDEN) {
      throw new Error("Review is already hidden");
    }

    const moderationReason = requireModerationReason(reason);
    const after = await this.repository.hideReview({
      reviewId,
      actorId,
      reason: moderationReason,
    });

    await this.repository.createModerationHistory({
      reviewId,
      action: ReviewModerationAction.HIDE,
      reason: moderationReason,
      actorId,
      beforeData: before,
      afterData: after,
    });

    await this.repository.createAuditLog(
      createAuditPayload(actorId, "REVIEW_HIDDEN", reviewId, before, after)
    );

    return after;
  }
}

export class UnhideReviewUseCase {
  constructor(private readonly repository: ReviewModerationRepository) {}

  async execute(actorId: string, reviewId: string, reason?: string) {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      REVIEW_MODERATION_MENU_CODE
    );

    assertPermission(permission, "canUpdate", "Forbidden: no permission to unhide review");

    const before = await this.repository.getReviewById(reviewId);
    if (!before) {
      throw new Error("Review not found");
    }

    if (before.status === ReviewStatus.DELETED) {
      throw new Error("Deleted review cannot be restored without special permission");
    }

    if (before.status !== ReviewStatus.HIDDEN) {
      throw new Error("Only hidden reviews can be restored");
    }

    const normalizedReason = reason?.trim() || undefined;
    const after = await this.repository.unhideReview({
      reviewId,
      actorId,
      reason: normalizedReason,
    });

    await this.repository.createModerationHistory({
      reviewId,
      action: ReviewModerationAction.UNHIDE,
      reason: normalizedReason,
      actorId,
      beforeData: before,
      afterData: after,
    });

    await this.repository.createAuditLog(
      createAuditPayload(actorId, "REVIEW_UNHIDDEN", reviewId, before, after)
    );

    return after;
  }
}

export class SoftDeleteReviewUseCase {
  constructor(private readonly repository: ReviewModerationRepository) {}

  async execute(actorId: string, reviewId: string, reason: string) {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      REVIEW_MODERATION_MENU_CODE
    );

    assertPermission(permission, "canDelete", "Forbidden: no permission to delete review");

    const before = await this.repository.getReviewById(reviewId);
    if (!before) {
      throw new Error("Review not found");
    }

    if (before.status === ReviewStatus.DELETED) {
      throw new Error("Review is already deleted");
    }

    const moderationReason = requireModerationReason(reason);
    const after = await this.repository.softDeleteReview({
      reviewId,
      actorId,
      reason: moderationReason,
    });

    await this.repository.createModerationHistory({
      reviewId,
      action: ReviewModerationAction.DELETE,
      reason: moderationReason,
      actorId,
      beforeData: before,
      afterData: after,
    });

    await this.repository.createAuditLog(
      createAuditPayload(actorId, "REVIEW_DELETED", reviewId, before, after)
    );

    return after;
  }
}
