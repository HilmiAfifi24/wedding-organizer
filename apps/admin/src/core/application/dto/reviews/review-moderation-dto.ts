import type {
  AdminReviewDetailDTO,
  AdminReviewListItemDTO,
  AdminReviewsQuery,
  PaginatedResult,
  ReviewModerationHistoryDTO,
} from "@wo/shared-types";

export type ReviewListResponse = PaginatedResult<AdminReviewListItemDTO>;

export type ReviewDetailResponse = AdminReviewDetailDTO;

export type ReviewHistoryResponse = ReviewModerationHistoryDTO[];

export interface ParsedReviewListQuery
  extends Required<Pick<AdminReviewsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">>,
    Omit<AdminReviewsQuery, "page" | "pageSize" | "sortBy" | "sortDirection"> {}
