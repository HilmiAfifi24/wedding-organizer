"use client";

import type { PaymentProofStatusHistoryDTO } from "@wo/shared-types";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";

import { getPaymentProofStatusBadgeVariant } from "../constants";

type PaymentHistoryTimelineProps = {
  uploadedAt: Date | string;
  items: PaymentProofStatusHistoryDTO[];
  isLoading: boolean;
  error?: string | null;
};

const formatDateTime = (value: Date | string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const PaymentHistoryTimeline = ({
  uploadedAt,
  items,
  isLoading,
  error,
}: PaymentHistoryTimelineProps) => {
  return (
    <Card className="border border-white/10 bg-slate-950/65 text-slate-100">
      <CardHeader>
        <CardTitle>Timeline Verifikasi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
          <p className="text-sm font-medium">Payment proof diunggah</p>
          <p className="text-xs text-slate-400">{formatDateTime(uploadedAt)}</p>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-white/10 px-4 py-6 text-sm text-slate-400">
            Memuat timeline verifikasi...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-white/10 px-4 py-6 text-sm text-slate-400">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-white/10 px-4 py-6 text-sm text-slate-400">
            Belum ada riwayat verifikasi payment proof.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={getPaymentProofStatusBadgeVariant(item.newStatus)}>
                  {item.newStatus}
                </Badge>
                <span className="text-xs text-slate-400">{formatDateTime(item.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm font-medium">
                {item.previousStatus ? `${item.previousStatus} -> ${item.newStatus}` : item.newStatus}
              </p>
              <p className="text-xs text-slate-400">Oleh {item.changedByName || "Vendor"}</p>
              {item.note ? <p className="mt-2 text-sm text-slate-300">{item.note}</p> : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
