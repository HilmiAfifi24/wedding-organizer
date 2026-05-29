import type {
  AdminReviewDetailDTO,
  AdminReviewListItemDTO,
  PaginatedResult,
  ReviewModerationHistoryDTO,
  ReviewStatus,
} from "@wo/shared-types";

export interface ReviewListFilters {
  search?: string;
  status?: ReviewStatus | "ALL";
  rating?: number | "ALL";
  vendor?: string;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: "createdAt" | "updatedAt" | "rating" | "status";
  sortDirection?: "asc" | "desc";
}

export type ReviewListResult = PaginatedResult<AdminReviewListItemDTO>;
export type ReviewDetailResult = AdminReviewDetailDTO;
export type ReviewHistoryResult = ReviewModerationHistoryDTO[];
