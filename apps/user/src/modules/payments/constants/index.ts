import { BookingStatus, PaymentProofStatus, PaymentStatus, PaymentTermStatus, PaymentType } from "@wo/shared-types";

export const PAYMENT_PROOF_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const PAYMENT_PROOF_ACCEPT_ATTRIBUTE = ".jpg,.jpeg,.png,.webp,.pdf";
export const DEFAULT_PAYMENT_PROOF_MAX_BYTES = Number.parseInt(
  process.env.NEXT_PUBLIC_USER_PAYMENT_UPLOAD_MAX_BYTES || "5242880",
  10
);

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  [PaymentType.DP]: "DP",
  [PaymentType.INSTALLMENT]: "Cicilan",
  [PaymentType.FINAL_PAYMENT]: "Pelunasan",
};

export const PAYMENT_TERM_STATUS_LABELS: Record<PaymentTermStatus, string> = {
  [PaymentTermStatus.UNPAID]: "Belum dibayar",
  [PaymentTermStatus.PENDING_VERIFICATION]: "Menunggu verifikasi",
  [PaymentTermStatus.VERIFIED]: "Terverifikasi",
  [PaymentTermStatus.REJECTED]: "Ditolak",
};

export const PAYMENT_PROOF_STATUS_LABELS: Record<PaymentProofStatus, string> = {
  [PaymentProofStatus.PENDING]: "Menunggu verifikasi",
  [PaymentProofStatus.VERIFIED]: "Terverifikasi",
  [PaymentProofStatus.REJECTED]: "Ditolak",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.UNPAID]: "Belum dibayar",
  [PaymentStatus.PARTIALLY_PAID]: "Dibayar sebagian",
  [PaymentStatus.PAID]: "Lunas",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "Menunggu konfirmasi vendor",
  [BookingStatus.PENDING_PAYMENT]: "Menunggu pembayaran",
  [BookingStatus.CONFIRMED]: "Terkonfirmasi",
  [BookingStatus.REJECTED]: "Ditolak",
  [BookingStatus.COMPLETED]: "Selesai",
  [BookingStatus.CANCELLED]: "Dibatalkan",
};

export const formatPaymentPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);

export const formatPaymentDate = (date: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

export const getTermStatusBadgeClassName = (status: PaymentTermStatus) => {
  switch (status) {
    case PaymentTermStatus.VERIFIED:
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case PaymentTermStatus.REJECTED:
      return "border-rose-200 bg-rose-50 text-rose-700";
    case PaymentTermStatus.PENDING_VERIFICATION:
      return "border-amber-200 bg-amber-50 text-amber-700";
    case PaymentTermStatus.UNPAID:
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
};

export const getProofStatusBadgeClassName = (status: PaymentProofStatus) => {
  switch (status) {
    case PaymentProofStatus.VERIFIED:
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case PaymentProofStatus.REJECTED:
      return "border-rose-200 bg-rose-50 text-rose-700";
    case PaymentProofStatus.PENDING:
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
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
