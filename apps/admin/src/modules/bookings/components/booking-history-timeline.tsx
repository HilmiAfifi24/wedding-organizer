"use client";

import type { BookingStatusHistoryDTO } from "@wo/shared-types";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";

import { getBookingStatusBadgeVariant } from "../constants";

type BookingHistoryTimelineProps = {
  bookingCreatedAt: Date | string;
  items: BookingStatusHistoryDTO[];
  isLoading: boolean;
  error?: string | null;
};

const formatDateTime = (value: Date | string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const BookingHistoryTimeline = ({
  bookingCreatedAt,
  items,
  isLoading,
  error,
}: BookingHistoryTimelineProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline Booking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border border-border/60 bg-background/60 p-4">
          <p className="text-sm font-medium">Booking dibuat</p>
          <p className="text-xs text-muted-foreground">{formatDateTime(bookingCreatedAt)}</p>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-border/60 px-4 py-6 text-sm text-muted-foreground">
            Memuat timeline booking...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-border/60 px-4 py-6 text-sm text-muted-foreground">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-border/60 px-4 py-6 text-sm text-muted-foreground">
            Belum ada perubahan status booking.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-lg border border-border/60 bg-background/60 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={getBookingStatusBadgeVariant(item.newStatus)}>{item.newStatus}</Badge>
                <span className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm font-medium">
                {item.previousStatus ? `${item.previousStatus} -> ${item.newStatus}` : item.newStatus}
              </p>
              <p className="text-xs text-muted-foreground">
                Oleh {item.changedByName || "Admin"}
              </p>
              {item.note ? <p className="mt-2 text-sm text-muted-foreground">{item.note}</p> : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
