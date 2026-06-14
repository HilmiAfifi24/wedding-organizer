import Link from "next/link";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";

import type { UserPaymentProofDetailDTO } from "../types";
import {
  PAYMENT_PROOF_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  formatPaymentDate,
  formatPaymentPrice,
  getProofStatusBadgeClassName,
} from "../constants";
import { isImageFile, isPdfFile } from "../services/file-preview";

export function PaymentProofDetailView({ payment }: { payment: UserPaymentProofDetailDTO }) {
  return (
    <div className="space-y-6">
      <Card className="rounded-[28px] border-white/80 bg-white/92 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-rose-500">Payment Proof Detail</p>
            <CardTitle className="mt-2 text-3xl text-slate-950">{payment.bookingCode}</CardTitle>
            <p className="mt-2 text-sm text-slate-600">
              Termin {payment.paymentTermSequence} · {PAYMENT_TYPE_LABELS[payment.paymentTermType]}
            </p>
          </div>
          <Badge className={`border ${getProofStatusBadgeClassName(payment.status)}`}>
            {PAYMENT_PROOF_STATUS_LABELS[payment.status]}
          </Badge>
        </CardHeader>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-[28px] border-white/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-950">Informasi pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Vendor</p>
              <p className="mt-1 text-base font-semibold text-slate-950">{payment.vendor.businessName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Layanan</p>
              <p className="mt-1">{payment.service?.name || "Paket vendor"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Nominal</p>
              <p className="mt-1 text-2xl font-semibold text-rose-600">{formatPaymentPrice(payment.amount)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Catatan</p>
              <p className="mt-1 leading-6">{payment.note || "Tidak ada catatan tambahan."}</p>
            </div>
            {payment.verificationNote ? (
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Catatan verifikasi</p>
                <p className="mt-1 leading-6 text-emerald-700">{payment.verificationNote}</p>
              </div>
            ) : null}
            {payment.rejectionReason ? (
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Alasan ditolak</p>
                <p className="mt-1 leading-6 text-rose-700">{payment.rejectionReason}</p>
              </div>
            ) : null}
            <Button asChild variant="outline" className="h-10 rounded-2xl">
              <Link href={`/bookings/${payment.bookingId}/payments`}>Kembali ke summary pembayaran</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-white/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-950">File bukti pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isImageFile(payment.fileUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={payment.fileUrl}
                alt="Preview bukti pembayaran"
                className="h-auto w-full rounded-3xl border border-slate-200 object-cover"
              />
            ) : isPdfFile(payment.fileUrl) ? (
              <iframe
                src={payment.fileUrl}
                title="Preview bukti pembayaran PDF"
                className="h-[520px] w-full rounded-3xl border border-slate-200 bg-white"
              />
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                Preview file tidak tersedia. Gunakan tombol buka file di bawah.
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <Button asChild className="h-10 rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
                <a href={payment.fileUrl} target="_blank" rel="noreferrer">
                  Buka file
                </a>
              </Button>
              <Button asChild variant="outline" className="h-10 rounded-2xl">
                <a href={payment.fileUrl} download>
                  Unduh file
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-[28px] border-white/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-950">Riwayat status proof</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payment.history.map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">
                      {PAYMENT_PROOF_STATUS_LABELS[item.newStatus]}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.note || "Status proof diperbarui."}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500">{formatPaymentDate(item.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
