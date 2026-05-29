"use client";

import type { ReviewModerationHistoryDTO } from "@wo/shared-types";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";

type ReviewHistoryTimelineProps = {
  createdAt: Date | string;
  items: ReviewModerationHistoryDTO[];
  isLoading: boolean;
  error?: string | null;
};

const formatDateTime = (value: Date | string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const ReviewHistoryTimeline = ({
  createdAt,
  items,
  isLoading,
  error,
}: ReviewHistoryTimelineProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderation History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border border-border/60 bg-background/60 p-4">
          <p className="text-sm font-medium">Review dibuat</p>
          <p className="text-xs text-muted-foreground">{formatDateTime(createdAt)}</p>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-border/60 px-4 py-6 text-sm text-muted-foreground">
            Memuat riwayat moderasi...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-border/60 px-4 py-6 text-sm text-muted-foreground">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-border/60 px-4 py-6 text-sm text-muted-foreground">
            Belum ada riwayat moderasi review.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-lg border border-border/60 bg-background/60 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{item.action}</Badge>
                <span className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm font-medium">Dilakukan oleh {item.actorName || "Admin"}</p>
              {item.reason ? <p className="mt-2 text-sm text-muted-foreground">{item.reason}</p> : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
