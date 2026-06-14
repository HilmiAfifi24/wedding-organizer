import { BookingStatus, PaymentStatus } from "@wo/shared-types";

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "Menunggu konfirmasi",
  [BookingStatus.PENDING_PAYMENT]: "Menunggu pembayaran",
  [BookingStatus.CONFIRMED]: "Terkonfirmasi",
  [BookingStatus.REJECTED]: "Ditolak",
  [BookingStatus.COMPLETED]: "Selesai",
  [BookingStatus.CANCELLED]: "Dibatalkan",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.UNPAID]: "Belum dibayar",
  [PaymentStatus.PARTIALLY_PAID]: "Dibayar sebagian",
  [PaymentStatus.PAID]: "Lunas",
};

export const BOOKING_SORT_OPTIONS = [
  { label: "Terbaru", value: "newest" },
  { label: "Terlama", value: "oldest" },
  { label: "Tanggal acara terdekat", value: "event-date-nearest" },
] as const;

export const formatBookingPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);

export const getBookingStatusBadgeClassName = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.CONFIRMED:
    case BookingStatus.COMPLETED:
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case BookingStatus.REJECTED:
    case BookingStatus.CANCELLED:
      return "border-rose-200 bg-rose-50 text-rose-700";
    case BookingStatus.PENDING_PAYMENT:
      return "border-amber-200 bg-amber-50 text-amber-700";
    case BookingStatus.PENDING:
    default:
      return "border-sky-200 bg-sky-50 text-sky-700";
  }
};

export const getPaymentStatusBadgeClassName = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.PAID:
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case PaymentStatus.PARTIALLY_PAID:
      return "border-amber-200 bg-amber-50 text-amber-700";
    case PaymentStatus.UNPAID:
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
};
