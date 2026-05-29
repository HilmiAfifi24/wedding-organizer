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
    <Card>
      <CardHeader>
        <CardTitle>Verification Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border border-border/60 bg-background/60 p-4">
          <p className="text-sm font-medium">Payment proof diunggah</p>
          <p className="text-xs text-muted-foreground">{formatDateTime(uploadedAt)}</p>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-border/60 px-4 py-6 text-sm text-muted-foreground">
            Memuat timeline verifikasi...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-border/60 px-4 py-6 text-sm text-muted-foreground">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-border/60 px-4 py-6 text-sm text-muted-foreground">
            Belum ada riwayat verifikasi payment proof.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-lg border border-border/60 bg-background/60 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={getPaymentProofStatusBadgeVariant(item.newStatus)}>
                  {item.newStatus}
                </Badge>
                {item.isOverride ? (
                  <Badge variant="outline" className="border-warning/50 text-warning">
                    Override
                  </Badge>
                ) : null}
                <span className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm font-medium">
                {item.previousStatus ? `${item.previousStatus} -> ${item.newStatus}` : item.newStatus}
              </p>
              <p className="text-xs text-muted-foreground">
                Oleh {item.changedByName || "System"}
              </p>
              {item.note ? <p className="mt-2 text-sm text-muted-foreground">{item.note}</p> : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
