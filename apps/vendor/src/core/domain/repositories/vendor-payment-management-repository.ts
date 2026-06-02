import type { AuditLogDTO, CreateAuditLogInput, PaymentProofStatusHistoryDTO } from "@wo/shared-types";

import type {
  ParsedVendorPaymentListQuery,
  VendorPaymentDetailDTO,
  VendorPaymentListItemDTO,
} from "@/core/application/dto/payments/vendor-payment-management-dto";

export interface VendorPaymentManagementRepository {
  listPaymentProofs(vendorId: string, query: ParsedVendorPaymentListQuery): Promise<{
    items: VendorPaymentListItemDTO[];
    totalItems: number;
  }>;

  getPaymentProofById(vendorId: string, paymentProofId: string): Promise<VendorPaymentDetailDTO | null>;

  getPaymentProofHistory(
    vendorId: string,
    paymentProofId: string
  ): Promise<PaymentProofStatusHistoryDTO[]>;

  verifyPaymentProof(input: {
    vendorId: string;
    paymentProofId: string;
    actorId: string;
    verificationNote?: string;
  }): Promise<{
    paymentProof: VendorPaymentDetailDTO;
    previousPaymentStatus: VendorPaymentDetailDTO["paymentProofStatus"];
    previousBookingStatus: VendorPaymentDetailDTO["bookingStatus"];
    bookingStatusChanged: boolean;
  }>;

  rejectPaymentProof(input: {
    vendorId: string;
    paymentProofId: string;
    actorId: string;
    rejectionReason: string;
  }): Promise<{
    paymentProof: VendorPaymentDetailDTO;
    previousPaymentStatus: VendorPaymentDetailDTO["paymentProofStatus"];
    previousBookingStatus: VendorPaymentDetailDTO["bookingStatus"];
    bookingStatusChanged: boolean;
  }>;

  createAuditLog(data: CreateAuditLogInput): Promise<AuditLogDTO>;
}
