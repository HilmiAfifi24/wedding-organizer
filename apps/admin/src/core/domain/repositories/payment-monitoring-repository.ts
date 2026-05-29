import type {
  AdminPaymentProofDetailDTO,
  AdminPaymentProofListItemDTO,
  AdminPaymentProofsQuery,
  AuditLogDTO,
  BookingStatus,
  CreateAuditLogInput,
  PaymentProofStatus,
  PaymentProofStatusHistoryDTO,
} from "@wo/shared-types";

import type { PaymentMonitoringPermissionFlags } from "@/core/domain/entities/payment-monitoring";

export interface PaymentMonitoringRepository {
  getActorPermissionByMenuCode(
    actorId: string,
    menuCode: string
  ): Promise<PaymentMonitoringPermissionFlags | null>;

  listPaymentProofs(
    query: Required<
      Pick<AdminPaymentProofsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">
    > &
      Omit<AdminPaymentProofsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">
  ): Promise<{ items: AdminPaymentProofListItemDTO[]; totalItems: number }>;

  getPaymentProofById(paymentProofId: string): Promise<AdminPaymentProofDetailDTO | null>;
  getPaymentProofHistory(paymentProofId: string): Promise<PaymentProofStatusHistoryDTO[]>;

  forceVerifyPaymentProof(input: {
    paymentProofId: string;
    actorId: string;
    reason: string;
  }): Promise<{
    paymentProof: AdminPaymentProofDetailDTO;
    bookingStatusChanged: boolean;
    previousPaymentStatus: PaymentProofStatus;
    previousBookingStatus: BookingStatus;
  }>;

  forceRejectPaymentProof(input: {
    paymentProofId: string;
    actorId: string;
    reason: string;
  }): Promise<{
    paymentProof: AdminPaymentProofDetailDTO;
    bookingStatusChanged: boolean;
    previousPaymentStatus: PaymentProofStatus;
    previousBookingStatus: BookingStatus;
  }>;

  createAuditLog(data: CreateAuditLogInput): Promise<AuditLogDTO>;
}
