import type {
  UserBookingPaymentSummaryDTO,
  UserPaymentProofDetailDTO,
  UserPaymentProofListItemDTO,
  UserPaymentTermItemDTO,
  UserPaymentTermUploadContextDTO,
} from "@/core/domain/repositories/user-payment-repository";

export type {
  UserBookingPaymentSummaryDTO,
  UserPaymentProofDetailDTO,
  UserPaymentProofListItemDTO,
  UserPaymentTermItemDTO,
  UserPaymentTermUploadContextDTO,
};

export interface UploadPaymentProofFormValues {
  bookingId: string;
  paymentTermId: string;
  amount: number;
  file: File;
  note?: string;
}
