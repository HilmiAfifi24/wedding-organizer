import { BookingStatus, VendorStatus, type AdminBookingDetailDTO } from "@wo/shared-types";

export const BOOKING_STATUS_FILTER_OPTIONS = [
  { label: "Semua Status", value: "ALL" },
  { label: "Pending", value: BookingStatus.PENDING },
  { label: "Pending Payment", value: BookingStatus.PENDING_PAYMENT },
  { label: "Confirmed", value: BookingStatus.CONFIRMED },
  { label: "Rejected", value: BookingStatus.REJECTED },
  { label: "Completed", value: BookingStatus.COMPLETED },
  { label: "Cancelled", value: BookingStatus.CANCELLED },
] as const;

export const BOOKING_SORT_OPTIONS = [
  { label: "Booking Date", value: "bookedAt" },
  { label: "Created At", value: "createdAt" },
  { label: "Updated At", value: "updatedAt" },
  { label: "Status", value: "status" },
] as const;

export const getBookingStatusBadgeVariant = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.CONFIRMED:
    case BookingStatus.COMPLETED:
      return "success" as const;
    case BookingStatus.PENDING:
    case BookingStatus.PENDING_PAYMENT:
      return "warning" as const;
    case BookingStatus.REJECTED:
    case BookingStatus.CANCELLED:
      return "danger" as const;
    default:
      return "outline" as const;
  }
};

export const getAvailableBookingActions = (booking: AdminBookingDetailDTO) => {
  if (booking.vendor.status === VendorStatus.SUSPENDED) {
    return [] as Array<{
      status: BookingStatus;
      label: string;
      description: string;
    }>;
  }

  const actions: Array<{
    status: BookingStatus;
    label: string;
    description: string;
  }> = [];

  if (booking.status === BookingStatus.PENDING) {
    actions.push(
      {
        status: BookingStatus.PENDING_PAYMENT,
        label: "Accept Booking",
        description: "Terima booking dan lanjutkan ke tahap pembayaran.",
      },
      {
        status: BookingStatus.REJECTED,
        label: "Reject Booking",
        description: "Tolak booking dan hentikan proses.",
      }
    );
  }

  if (booking.status === BookingStatus.PENDING_PAYMENT) {
    if (booking.paymentProof) {
      actions.push({
        status: BookingStatus.CONFIRMED,
        label: "Verify Payment",
        description: "Verifikasi payment proof lalu konfirmasi booking.",
      });
    }

    actions.push({
      status: BookingStatus.CANCELLED,
      label: "Cancel Booking",
      description: "Batalkan booking pada tahap pembayaran.",
    });
  }

  if (booking.status === BookingStatus.CONFIRMED) {
    actions.push(
      {
        status: BookingStatus.COMPLETED,
        label: "Mark Completed",
        description: "Tandai booking sebagai selesai.",
      },
      {
        status: BookingStatus.CANCELLED,
        label: "Cancel Booking",
        description: "Batalkan booking meski sudah dikonfirmasi.",
      }
    );
  }

  return actions;
};
