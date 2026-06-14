import Link from "next/link";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";

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

export function BookingDetailView({
  booking,
  showCreatedMessage = false,
}: {
  booking: UserBookingDetailDTO;
  showCreatedMessage?: boolean;
}) {
  return (
    <div className="space-y-6">
      {showCreatedMessage ? (
        <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          Booking berhasil dibuat. Menunggu konfirmasi dari vendor.
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[28px] border-white/80 bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-rose-500">
                Booking Detail
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
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Vendor</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{booking.vendor.businessName}</p>
              <p className="mt-1 text-sm text-slate-600">
                {[booking.vendor.city, booking.vendor.province].filter(Boolean).join(", ") ||
                  "Lokasi belum tersedia"}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Layanan</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {booking.service?.name || "Layanan tidak tersedia"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {booking.service ? formatBookingPrice(booking.service.price) : "-"}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tanggal acara</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {formatBookingDate(booking.eventDate)}
              </p>
              <p className="mt-1 text-sm text-slate-600">{booking.eventLocation}</p>
            </div>

            <div className="rounded-3xl bg-slate-950 p-4 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Total awal</p>
              <p className="mt-2 text-3xl font-semibold">{formatBookingPrice(booking.totalAmount)}</p>
              <p className="mt-1 text-sm text-slate-300">Status pembayaran: {PAYMENT_STATUS_LABELS[booking.paymentStatus]}</p>
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
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Catatan</p>
              <p className="mt-1 leading-6">{booking.notes || "Tidak ada catatan tambahan."}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Permintaan khusus</p>
              <p className="mt-1 leading-6">
                {booking.specialRequest || "Tidak ada permintaan khusus."}
              </p>
            </div>
            <Button asChild className="h-11 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
              <Link href={USER_AUTH_ROUTES.bookings}>Lihat semua booking</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 w-full rounded-2xl">
              <Link href={`/bookings/${booking.id}/payments`}>Kelola pembayaran</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-[28px] border-white/80 bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-950">Riwayat status</CardTitle>
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
