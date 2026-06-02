import type { PaymentProofStatus } from "@wo/shared-types";

import type {
  VendorPaymentDetailResponse,
  VendorPaymentHistoryResponse,
  VendorPaymentListResponse,
} from "@/core/application/dto/payments/vendor-payment-management-dto";

export interface PaymentProofListFilters {
  search?: string;
  paymentProofStatus?: PaymentProofStatus | "ALL";
  customer?: string;
  bookedFrom?: string;
  bookedTo?: string;
  uploadedFrom?: string;
  uploadedTo?: string;
  sortBy?: "bookedAt" | "createdAt" | "updatedAt" | "status";
  sortDirection?: "asc" | "desc";
}

export type VendorPaymentListResult = VendorPaymentListResponse;
export type VendorPaymentDetailResult = VendorPaymentDetailResponse;
export type VendorPaymentHistoryResult = VendorPaymentHistoryResponse;
