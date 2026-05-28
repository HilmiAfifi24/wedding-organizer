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
  const actions: Array<{
    status: BookingStatus;
    label: string;
    description: string;
  }> = [];

  if (booking.status === BookingStatus.PENDING) {
    if (booking.vendor.status !== VendorStatus.SUSPENDED) {
      actions.push({
        status: BookingStatus.PENDING_PAYMENT,
        label: "Set Pending Payment",
        description: "Lanjutkan booking ke tahap menunggu pembayaran.",
      });
    }

    actions.push({
      status: BookingStatus.REJECTED,
      label: "Reject Booking",
      description: "Tolak booking ini dan hentikan proses.",
    });
  }

  if (booking.status === BookingStatus.PENDING_PAYMENT) {
    if (booking.vendor.status !== VendorStatus.SUSPENDED) {
      actions.push({
        status: BookingStatus.CONFIRMED,
        label: "Confirm Booking",
        description: "Konfirmasi booking setelah pembayaran sesuai.",
      });
    }

    actions.push({
      status: BookingStatus.CANCELLED,
      label: "Cancel Booking",
      description: "Batalkan booking ini.",
    });
  }

  if (booking.status === BookingStatus.CONFIRMED) {
    if (booking.vendor.status !== VendorStatus.SUSPENDED) {
      actions.push({
        status: BookingStatus.COMPLETED,
        label: "Complete Booking",
        description: "Tandai booking sebagai selesai.",
      });
    }

    actions.push({
      status: BookingStatus.CANCELLED,
      label: "Cancel Booking",
      description: "Batalkan booking meski sudah terkonfirmasi.",
    });
  }

  return actions;
};
