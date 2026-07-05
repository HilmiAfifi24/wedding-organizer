import Link from "next/link";
import { Badge, Button, Card, CardContent } from "@wo/ui-components";

import type { UserPaymentProofListItemDTO } from "../types";
import {
  PAYMENT_PROOF_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  formatPaymentDate,
  formatPaymentPrice,
  getProofStatusBadgeClassName,
} from "../constants";

export function PaymentsList({ items }: { items: UserPaymentProofListItemDTO[] }) {
  if (!items.length) {
    return (
      <Card className="rounded-[28px] border border-dashed border-white/10 bg-card shadow-2xl">
        <CardContent className="space-y-3 p-8 text-center">
          <p className="text-xl font-semibold text-white">Belum ada payment proof</p>
          <p className="text-sm text-slate-300">
            Setelah vendor meminta pembayaran, Anda bisa mengunggah bukti bayar dari halaman booking.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <Card key={item.id} className="rounded-[28px] border-white/10 bg-card shadow-2xl">
          <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-lg font-semibold text-white">{item.bookingCode}</p>
                <Badge className={`border ${getProofStatusBadgeClassName(item.status)}`}>
                  {PAYMENT_PROOF_STATUS_LABELS[item.status]}
                </Badge>
              </div>
              <p className="text-sm text-slate-300">
                Termin {item.paymentTermSequence} · {PAYMENT_TYPE_LABELS[item.paymentTermType]} ·{" "}
                {item.vendor.businessName}
              </p>
              <p className="text-sm text-slate-300">
                Upload {formatPaymentDate(item.uploadedAt)} · {formatPaymentPrice(item.amount)}
              </p>
              {item.rejectionReason ? (
                <p className="text-sm text-rose-400 font-semibold">Ditolak: {item.rejectionReason}</p>
              ) : null}
            </div>
            <Button asChild className="h-10 rounded-2xl bg-rose-600 text-white hover:bg-rose-700">
              <Link href={`/payments/${item.id}`}>Lihat detail</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
