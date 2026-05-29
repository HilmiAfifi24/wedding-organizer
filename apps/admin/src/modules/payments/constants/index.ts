import {
  BookingStatus,
  PaymentProofStatus,
  type AdminPaymentProofDetailDTO,
} from "@wo/shared-types";

export const PAYMENT_PROOF_STATUS_FILTER_OPTIONS = [
  { label: "Semua Status Proof", value: "ALL" },
  { label: "Pending", value: PaymentProofStatus.PENDING },
  { label: "Verified", value: PaymentProofStatus.VERIFIED },
  { label: "Rejected", value: PaymentProofStatus.REJECTED },
] as const;

export const BOOKING_STATUS_FILTER_OPTIONS = [
  { label: "Semua Status Booking", value: "ALL" },
  { label: "Pending", value: BookingStatus.PENDING },
  { label: "Pending Payment", value: BookingStatus.PENDING_PAYMENT },
  { label: "Confirmed", value: BookingStatus.CONFIRMED },
  { label: "Rejected", value: BookingStatus.REJECTED },
  { label: "Completed", value: BookingStatus.COMPLETED },
  { label: "Cancelled", value: BookingStatus.CANCELLED },
] as const;

export const PAYMENT_PROOF_SORT_OPTIONS = [
  { label: "Uploaded At", value: "createdAt" },
  { label: "Updated At", value: "updatedAt" },
  { label: "Status", value: "status" },
  { label: "Verified At", value: "verifiedAt" },
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

export const getAvailablePaymentActions = (paymentProof: AdminPaymentProofDetailDTO) => {
  const actions: Array<{
    type: "force-verify" | "force-reject";
    label: string;
    description: string;
  }> = [];

  if (paymentProof.booking.status === BookingStatus.PENDING_PAYMENT) {
    if (paymentProof.paymentProofStatus !== PaymentProofStatus.VERIFIED) {
      actions.push({
        type: "force-verify",
        label: "Force Verify",
        description: "Admin override untuk mengonfirmasi pembayaran dan booking.",
      });
    }

    if (paymentProof.paymentProofStatus !== PaymentProofStatus.REJECTED) {
      actions.push({
        type: "force-reject",
        label: "Force Reject",
        description: "Admin override untuk menolak payment proof namun booking tetap menunggu pembayaran.",
      });
    }
  }

  if (
    paymentProof.booking.status === BookingStatus.CONFIRMED &&
    paymentProof.paymentProofStatus === PaymentProofStatus.VERIFIED
  ) {
    actions.push({
      type: "force-reject",
      label: "Override to Reject",
      description: "Admin override untuk mengembalikan booking ke PENDING_PAYMENT karena koreksi/dispute.",
    });
  }

  return actions;
};
