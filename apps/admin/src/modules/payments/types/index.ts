import type {
  AdminPaymentProofDetailDTO,
  AdminPaymentProofListItemDTO,
  BookingStatus,
  PaginatedResult,
  PaymentProofStatus,
  PaymentProofStatusHistoryDTO,
} from "@wo/shared-types";

export interface PaymentProofListFilters {
  search?: string;
  paymentProofStatus?: PaymentProofStatus | "ALL";
  bookingStatus?: BookingStatus | "ALL";
  vendor?: string;
  uploadedFrom?: string;
  uploadedTo?: string;
  sortBy?: "createdAt" | "updatedAt" | "status" | "verifiedAt";
  sortDirection?: "asc" | "desc";
}

export type PaymentProofListResult = PaginatedResult<AdminPaymentProofListItemDTO>;
export type PaymentProofDetailResult = AdminPaymentProofDetailDTO;
export type PaymentProofHistoryResult = PaymentProofStatusHistoryDTO[];
