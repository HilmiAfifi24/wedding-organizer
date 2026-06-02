import { BookingStatus, PaymentProofStatus } from "@wo/shared-types";

import type { VendorPaymentDetailDTO } from "@/core/application/dto/payments/vendor-payment-management-dto";

export const PAYMENT_PROOF_STATUS_FILTER_OPTIONS = [
  { label: "Semua Status", value: "ALL" },
  { label: "Pending", value: PaymentProofStatus.PENDING },
  { label: "Verified", value: PaymentProofStatus.VERIFIED },
  { label: "Rejected", value: PaymentProofStatus.REJECTED },
] as const;

export const PAYMENT_PROOF_SORT_OPTIONS = [
  { label: "Tanggal Upload", value: "createdAt" },
  { label: "Tanggal Booking", value: "bookedAt" },
  { label: "Terakhir Update", value: "updatedAt" },
  { label: "Status", value: "status" },
] as const;

export const getPaymentProofStatusBadgeVariant = (status: PaymentProofStatus) => {
  switch (status) {
    case PaymentProofStatus.VERIFIED:
      return "success" as const;
    case PaymentProofStatus.REJECTED:
      return "danger" as const;
    default:
      return "warning" as const;
  }
};

export const getBookingStatusBadgeVariant = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.CONFIRMED:
    case BookingStatus.COMPLETED:
      return "success" as const;
    case BookingStatus.REJECTED:
    case BookingStatus.CANCELLED:
      return "danger" as const;
    default:
      return "warning" as const;
  }
};

export const getAvailablePaymentActions = (paymentProof: VendorPaymentDetailDTO) => {
  if (
    paymentProof.paymentProofStatus === PaymentProofStatus.PENDING &&
    paymentProof.booking.status === BookingStatus.PENDING_PAYMENT
  ) {
    return [
      {
        type: "verify" as const,
        label: "Verify Payment",
        description: "Verifikasi pembayaran dan konfirmasi booking customer.",
      },
      {
        type: "reject" as const,
        label: "Reject Payment",
        description: "Tolak payment proof dan minta customer mengunggah ulang bukti bayar.",
      },
    ];
  }

  return [] as Array<{
    type: "verify" | "reject";
    label: string;
    description: string;
  }>;
};
