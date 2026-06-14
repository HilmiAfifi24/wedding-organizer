import Link from "next/link";
import { Badge, Button, Card, CardContent } from "@wo/ui-components";

import type { UserPaymentTermItemDTO } from "../types";
import {
  PAYMENT_TERM_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  formatPaymentDate,
  formatPaymentPrice,
  getTermStatusBadgeClassName,
} from "../constants";

const canUploadForTerm = (status: UserPaymentTermItemDTO["status"]) =>
  status === "UNPAID" || status === "REJECTED";

export function PaymentTermCard({
  bookingId,
  term,
}: {
  bookingId: string;
  term: UserPaymentTermItemDTO;
}) {
  return (
    <Card className="rounded-[28px] border-white/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Termin {term.sequence} · {PAYMENT_TYPE_LABELS[term.type]}
            </p>
            <p className="mt-1 text-xl font-semibold text-rose-600">
              {formatPaymentPrice(term.amount)}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {term.dueDate ? `Jatuh tempo ${formatPaymentDate(term.dueDate)}` : "Tanggal jatuh tempo belum ditentukan"}
            </p>
          </div>
          <Badge className={`border ${getTermStatusBadgeClassName(term.status)}`}>
            {PAYMENT_TERM_STATUS_LABELS[term.status]}
          </Badge>
        </div>

        {term.latestProof ? (
          <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Upload terakhir</p>
            <p className="mt-1">Nominal: {formatPaymentPrice(term.latestProof.amount)}</p>
            <p>Status: {term.latestProof.status}</p>
            {term.latestProof.rejectionReason ? (
              <p className="mt-2 text-rose-700">Alasan ditolak: {term.latestProof.rejectionReason}</p>
            ) : null}
          </div>
        ) : (
          <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
            Belum ada bukti pembayaran yang diunggah untuk termin ini.
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {canUploadForTerm(term.status) ? (
            <Button asChild className="h-10 rounded-2xl bg-rose-600 text-white hover:bg-rose-700">
              <Link href={`/bookings/${bookingId}/payments/upload?termId=${term.id}`}>
                {term.status === "REJECTED" ? "Upload ulang" : "Upload bukti"}
              </Link>
            </Button>
          ) : null}

          {term.latestProof ? (
            <Button asChild variant="outline" className="h-10 rounded-2xl">
              <Link href={`/payments/${term.latestProof.id}`}>Lihat detail proof</Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
