import Link from "next/link";
import { Badge, Button, Card, CardHeader, CardTitle } from "@wo/ui-components";

import type { UserBookingPaymentSummaryDTO } from "../types";
import {
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  getPaymentStatusBadgeClassName,
} from "../constants";
import { PaymentSummaryCards } from "./payment-summary-cards";
import { PaymentTermCard } from "./payment-term-card";

export function BookingPaymentsSummary({ summary }: { summary: UserBookingPaymentSummaryDTO }) {
  return (
    <div className="space-y-6">
      <Card className="rounded-[28px] border-white/80 bg-white/92 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-rose-500">Booking Payments</p>
            <CardTitle className="mt-2 text-3xl text-slate-950">{summary.bookingCode}</CardTitle>
            <p className="mt-2 text-sm text-slate-600">
              {summary.vendor.businessName} · {summary.service?.name || "Paket vendor"}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Status booking: {BOOKING_STATUS_LABELS[summary.bookingStatus]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={`border ${getPaymentStatusBadgeClassName(summary.paymentStatus)}`}>
              {PAYMENT_STATUS_LABELS[summary.paymentStatus]}
            </Badge>
            <Button asChild variant="outline" className="h-10 rounded-2xl">
              <Link href={`/bookings/${summary.bookingId}`}>Kembali ke booking</Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <PaymentSummaryCards summary={summary} />

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Daftar termin pembayaran</h2>
          <p className="mt-1 text-sm text-slate-600">
            Upload bukti pembayaran untuk termin yang belum dibayar atau pernah ditolak.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {summary.terms.map((term) => (
            <PaymentTermCard key={term.id} bookingId={summary.bookingId} term={term} />
          ))}
        </div>
      </section>
    </div>
  );
}
