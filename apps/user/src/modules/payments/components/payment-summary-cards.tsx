import { Badge, Card, CardContent } from "@wo/ui-components";

import type { UserBookingPaymentSummaryDTO } from "../types";
import {
  PAYMENT_STATUS_LABELS,
  formatPaymentPrice,
  getPaymentStatusBadgeClassName,
} from "../constants";

export function PaymentSummaryCards({ summary }: { summary: UserBookingPaymentSummaryDTO }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card className="rounded-[28px] border-white/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <CardContent className="space-y-2 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Total booking</p>
          <p className="text-2xl font-semibold text-slate-950">{formatPaymentPrice(summary.totalAmount)}</p>
        </CardContent>
      </Card>
      <Card className="rounded-[28px] border-white/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <CardContent className="space-y-2 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Total dibayar</p>
          <p className="text-2xl font-semibold text-emerald-600">
            {formatPaymentPrice(summary.totalPaidAmount)}
          </p>
        </CardContent>
      </Card>
      <Card className="rounded-[28px] border-white/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <CardContent className="space-y-2 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Sisa tagihan</p>
          <p className="text-2xl font-semibold text-rose-600">
            {formatPaymentPrice(summary.remainingBalance)}
          </p>
        </CardContent>
      </Card>
      <Card className="rounded-[28px] border-white/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <CardContent className="space-y-2 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Status pembayaran</p>
          <Badge className={`border ${getPaymentStatusBadgeClassName(summary.paymentStatus)}`}>
            {PAYMENT_STATUS_LABELS[summary.paymentStatus]}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
