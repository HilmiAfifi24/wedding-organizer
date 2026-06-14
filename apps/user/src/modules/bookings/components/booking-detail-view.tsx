import Link from "next/link";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";
import { BookingStatus } from "@wo/shared-types";

import type { UserBookingDetailDTO } from "../types";
import {
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  formatBookingPrice,
  getBookingStatusBadgeClassName,
  getPaymentStatusBadgeClassName,
} from "../constants";
import { formatBookingDate } from "../services/event-date";
import { USER_AUTH_ROUTES } from "@/modules/auth/constants/routes";
import {
  PAYMENT_PROOF_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  formatPaymentPrice,
  getProofStatusBadgeClassName,
} from "@/modules/payments/constants";
import { PaymentSummaryCards } from "@/modules/payments/components/payment-summary-cards";
import { PaymentTermCard } from "@/modules/payments/components/payment-term-card";

type BookingAlertTone = "rose" | "emerald" | "sky";

const getBookingAlert = (
  status: BookingStatus
): { tone: BookingAlertTone; title: string; description: string } | null => {
  switch (status) {
    case BookingStatus.REJECTED:
      return {
        tone: "rose",
        title: "Booking ditolak",
        description: "Vendor menolak booking ini. Anda tidak dapat melakukan perubahan lebih lanjut.",
      };
    case BookingStatus.CANCELLED:
      return {
        tone: "rose",
        title: "Booking dibatalkan",
        description: "Booking ini telah dibatalkan dan bersifat read-only.",
      };
    case BookingStatus.COMPLETED:
      return {
        tone: "emerald",
        title: "Booking selesai",
        description: "Acara telah selesai. Data booking tetap tersedia sebagai arsip.",
      };
    case BookingStatus.PENDING:
      return {
        tone: "sky",
        title: "Menunggu respons vendor",
        description: "Vendor belum menerima atau menolak booking Anda.",
      };
    default:
      return null;
  }
};

const getAlertClassName = (tone: BookingAlertTone) => {
  switch (tone) {
    case "emerald":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "sky":
      return "border-sky-200 bg-sky-50 text-sky-800";
    case "rose":
    default:
      return "border-rose-200 bg-rose-50 text-rose-800";
  }
};

export function BookingDetailView({
  booking,
  showCreatedMessage = false,
}: {
  booking: UserBookingDetailDTO;
  showCreatedMessage?: boolean;
}) {
  const bookingAlert = getBookingAlert(booking.status);
  const paymentSummary = {
    bookingId: booking.id,
    bookingCode: booking.bookingCode,
    bookingStatus: booking.status,
    paymentStatus: booking.paymentStatus,
    totalAmount: booking.totalAmount,
    totalPaidAmount: booking.totalPaidAmount,
    remainingBalance: booking.remainingBalance,
    vendor: {
      id: booking.vendor.id,
      businessName: booking.vendor.businessName,
      city: booking.vendor.city ?? null,
      province: booking.vendor.province ?? null,
    },
    service: booking.service
      ? {
          id: booking.service.id,
          name: booking.service.name,
          price: booking.service.price,
        }
      : null,
    terms: booking.paymentTerms,
  };

  return (
    <div className="space-y-6">
      {showCreatedMessage ? (
        <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          Booking berhasil dibuat. Menunggu konfirmasi dari vendor.
        </div>
      ) : null}

      {bookingAlert ? (
        <div className={`rounded-[28px] border px-5 py-4 text-sm ${getAlertClassName(bookingAlert.tone)}`}>
          <p className="font-semibold">{bookingAlert.title}</p>
          <p className="mt-1">{bookingAlert.description}</p>
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[28px] border-white/80 bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-rose-500">
                Booking Tracking
              </p>
              <CardTitle className="mt-2 text-3xl text-slate-950">{booking.bookingCode}</CardTitle>
              <p className="mt-2 text-sm text-slate-600">
                Dibuat pada {formatBookingDate(booking.createdAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className={`border ${getBookingStatusBadgeClassName(booking.status)}`}>
                {BOOKING_STATUS_LABELS[booking.status]}
              </Badge>
              <Badge className={`border ${getPaymentStatusBadgeClassName(booking.paymentStatus)}`}>
                {PAYMENT_STATUS_LABELS[booking.paymentStatus]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tanggal acara</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {formatBookingDate(booking.eventDate)}
              </p>
              <p className="mt-1 text-sm text-slate-600">{booking.eventLocation}</p>
            </div>

            <div className="rounded-3xl bg-slate-950 p-4 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Ringkasan total</p>
              <p className="mt-2 text-3xl font-semibold">{formatBookingPrice(booking.totalAmount)}</p>
              <p className="mt-1 text-sm text-slate-300">
                Sisa pembayaran {formatBookingPrice(booking.remainingBalance)}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Catatan</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {booking.notes || "Tidak ada catatan tambahan."}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Permintaan khusus</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {booking.specialRequest || "Tidak ada permintaan khusus."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-white/80 bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-950">Informasi customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Nama</p>
              <p className="mt-1 text-base font-semibold text-slate-950">{booking.customerName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Kontak</p>
              <p className="mt-1">{booking.customerPhone}</p>
              <p>{booking.customerEmail}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Jumlah tamu</p>
              <p className="mt-1">{booking.guestCount ?? "Belum diisi"}</p>
            </div>
            <Button asChild className="h-11 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
              <Link href={USER_AUTH_ROUTES.bookings}>Lihat semua booking</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 w-full rounded-2xl">
              <Link href={`/bookings/${booking.id}/payments`}>Halaman pembayaran lengkap</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-[28px] border-white/80 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-950">Informasi vendor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div>
              <p className="text-base font-semibold text-slate-950">{booking.vendor.businessName}</p>
              <p className="mt-1">
                {[booking.vendor.city, booking.vendor.province].filter(Boolean).join(", ") ||
                  "Lokasi belum tersedia"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Kategori</p>
              <p className="mt-1">{booking.vendor.categoryName || "Belum tersedia"}</p>
            </div>
            {booking.vendor.phoneNumber || booking.vendor.whatsappNumber || booking.vendor.contactInfo ? (
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Kontak vendor</p>
                <div className="mt-1 space-y-1">
                  {booking.vendor.phoneNumber ? <p>Telepon: {booking.vendor.phoneNumber}</p> : null}
                  {booking.vendor.whatsappNumber ? <p>WhatsApp: {booking.vendor.whatsappNumber}</p> : null}
                  {booking.vendor.contactInfo ? <p>Info lain: {booking.vendor.contactInfo}</p> : null}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-white/80 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-950">Informasi layanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-950">
                  {booking.service?.name || "Layanan tidak tersedia"}
                </p>
                <p className="mt-1 leading-6">
                  {booking.service?.description || "Tidak ada deskripsi layanan."}
                </p>
              </div>
              <p className="text-lg font-semibold text-rose-600">
                {booking.service ? formatBookingPrice(booking.service.price) : "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Ringkasan pembayaran</h2>
          <p className="mt-1 text-sm text-slate-600">
            Total dibayar dan sisa tagihan dihitung dari termin yang sudah terverifikasi.
          </p>
        </div>
        <PaymentSummaryCards summary={paymentSummary} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Termin pembayaran</h2>
          <p className="mt-1 text-sm text-slate-600">
            Upload bukti hanya tersedia saat booking menunggu pembayaran atau sudah terkonfirmasi.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {booking.paymentTerms.map((term) => (
            <PaymentTermCard
              key={term.id}
              bookingId={booking.id}
              bookingStatus={booking.status}
              term={term}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[28px] border-white/80 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-950">Daftar bukti pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {booking.paymentProofs.length ? (
              booking.paymentProofs.map((proof) => (
                <div key={proof.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">
                        Termin {proof.paymentTermSequence} · {PAYMENT_TYPE_LABELS[proof.paymentTermType]}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Diunggah {formatBookingDate(proof.createdAt)}
                      </p>
                      <p className="mt-2 text-sm text-slate-700">
                        Nominal {formatPaymentPrice(proof.amount)}
                      </p>
                      {proof.rejectionReason ? (
                        <p className="mt-2 text-sm text-rose-700">
                          Alasan ditolak: {proof.rejectionReason}
                        </p>
                      ) : null}
                      {proof.verificationNote ? (
                        <p className="mt-2 text-sm text-emerald-700">
                          Catatan verifikasi: {proof.verificationNote}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-3 lg:items-end">
                      <Badge className={`border ${getProofStatusBadgeClassName(proof.status)}`}>
                        {PAYMENT_PROOF_STATUS_LABELS[proof.status]}
                      </Badge>
                      <Button asChild variant="outline" className="h-10 rounded-2xl">
                        <Link href={`/payments/${proof.id}`}>Lihat detail proof</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                Belum ada bukti pembayaran yang diunggah untuk booking ini.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-white/80 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-950">Timeline booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {booking.timeline.map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {item.description || "Aktivitas booking diperbarui."}
                    </p>
                    {item.actorName ? (
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                        {item.actorName}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-sm text-slate-500">{formatBookingDate(item.createdAt)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-[28px] border-white/80 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-950">Riwayat status booking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {booking.history.map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-base font-semibold text-slate-950">
                      {BOOKING_STATUS_LABELS[item.newStatus]}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.note || "Status booking diperbarui."}
                    </p>
                  </div>
                  <div className="text-sm text-slate-500">
                    <p>{formatBookingDate(item.createdAt)}</p>
                    <p>{item.changedByName || "System"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
