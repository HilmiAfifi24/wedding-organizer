import type {
  AdminReviewDetailDTO,
  AdminReviewListItemDTO,
  AdminReviewsQuery,
  AuditLogDTO,
  CreateAuditLogInput,
  ReviewModerationAction,
  ReviewModerationHistoryDTO,
} from "@wo/shared-types";

import type { ReviewModerationPermissionFlags } from "@/core/domain/entities/review-moderation";

export interface ReviewModerationRepository {
  getActorPermissionByMenuCode(
    actorId: string,
    menuCode: string
  ): Promise<ReviewModerationPermissionFlags | null>;

  listReviews(
    query: Required<Pick<AdminReviewsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">> &
      Omit<AdminReviewsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">
  ): Promise<{ items: AdminReviewListItemDTO[]; totalItems: number }>;

  getReviewById(reviewId: string): Promise<AdminReviewDetailDTO | null>;
  getReviewHistory(reviewId: string): Promise<ReviewModerationHistoryDTO[]>;

  hideReview(input: {
    reviewId: string;
    actorId: string;
    reason: string;
  }): Promise<AdminReviewDetailDTO>;

  unhideReview(input: {
    reviewId: string;
    actorId: string;
    reason?: string;
  }): Promise<AdminReviewDetailDTO>;

  softDeleteReview(input: {
    reviewId: string;
    actorId: string;
    reason: string;
  }): Promise<AdminReviewDetailDTO>;

  createModerationHistory(input: {
    reviewId: string;
    action: ReviewModerationAction;
    reason?: string;
    actorId: string;
    beforeData?: unknown;
    afterData?: unknown;
  }): Promise<ReviewModerationHistoryDTO>;

  createAuditLog(data: CreateAuditLogInput): Promise<AuditLogDTO>;
}
