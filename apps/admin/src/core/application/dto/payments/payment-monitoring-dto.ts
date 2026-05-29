import type {
  AdminPaymentProofDetailDTO,
  AdminPaymentProofListItemDTO,
  AdminPaymentProofsQuery,
  PaginatedResult,
  PaymentProofStatusHistoryDTO,
} from "@wo/shared-types";

export type PaymentProofListResponse = PaginatedResult<AdminPaymentProofListItemDTO>;

export type PaymentProofDetailResponse = AdminPaymentProofDetailDTO;

export type PaymentProofHistoryResponse = PaymentProofStatusHistoryDTO[];

export interface ParsedPaymentProofListQuery
  extends Required<
      Pick<AdminPaymentProofsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">
    >,
    Omit<AdminPaymentProofsQuery, "page" | "pageSize" | "sortBy" | "sortDirection"> {}
