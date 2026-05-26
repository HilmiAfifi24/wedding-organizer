import type {
  CreatePaymentProofInput,
  PaymentProofDTO,
  VerifyPaymentProofInput,
} from "@wo/shared-types";

export interface PaymentProofRepository {
  findByBookingId(bookingId: string): Promise<PaymentProofDTO | null>;
  create(data: CreatePaymentProofInput): Promise<PaymentProofDTO>;
  verify(id: string, data: VerifyPaymentProofInput): Promise<PaymentProofDTO>;
}
