import {
  PaymentReminderType,
  PaymentType,
} from "@wo/shared-types";

import type { PaymentReminderCandidateDTO } from "@/core/domain/repositories/payment-reminder-repository";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(value);

const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  [PaymentType.DP]: "DP",
  [PaymentType.INSTALLMENT]: "Cicilan",
  [PaymentType.FINAL_PAYMENT]: "Pelunasan",
};

const buildPaymentLink = (bookingId: string) => {
  const baseUrl = process.env.USER_APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "";
  const path = `/bookings/${bookingId}/payments`;

  if (!baseUrl) {
    return "Silakan buka halaman pembayaran pada akun Anda.";
  }

  return `Detail pembayaran: ${baseUrl.replace(/\/$/, "")}${path}`;
};

const buildReminderIntro = (candidate: PaymentReminderCandidateDTO, reminderType: PaymentReminderType) => {
  switch (reminderType) {
    case PaymentReminderType.D7:
      return `Ini pengingat bahwa pembayaran ${PAYMENT_TYPE_LABELS[candidate.termType]} untuk booking ${candidate.bookingCode} akan jatuh tempo 7 hari lagi.`;
    case PaymentReminderType.D1:
      return `Ini pengingat bahwa pembayaran ${PAYMENT_TYPE_LABELS[candidate.termType]} untuk booking ${candidate.bookingCode} akan jatuh tempo besok.`;
    case PaymentReminderType.D0:
      return `Ini pengingat bahwa pembayaran ${PAYMENT_TYPE_LABELS[candidate.termType]} untuk booking ${candidate.bookingCode} jatuh tempo hari ini.`;
    case PaymentReminderType.OVERDUE:
    default:
      return `Pembayaran ${PAYMENT_TYPE_LABELS[candidate.termType]} untuk booking ${candidate.bookingCode} telah melewati jatuh tempo.`;
  }
};

export const buildPaymentReminderMessage = (
  candidate: PaymentReminderCandidateDTO,
  reminderType: PaymentReminderType
) =>
  [
    `Halo ${candidate.customerName},`,
    "",
    buildReminderIntro(candidate, reminderType),
    `Vendor: ${candidate.vendorBusinessName}`,
    `Termin: ${candidate.termSequence} (${PAYMENT_TYPE_LABELS[candidate.termType]})`,
    `Nominal: ${formatCurrency(candidate.amount)}`,
    `Jatuh tempo: ${formatDate(candidate.dueDate)}`,
    "",
    buildPaymentLink(candidate.bookingId),
    "Terima kasih.",
  ].join("\n");
