import Link from "next/link";
import { Badge, Button, Card, CardContent } from "@wo/ui-components";

import type { UserBookingListItemDTO } from "../types";
import {
  BOOKING_STATUS_LABELS,
  formatBookingPrice,
  getBookingStatusBadgeClassName,
} from "../constants";
import { formatBookingDate } from "../services/event-date";
import { USER_AUTH_ROUTES } from "@/modules/auth/constants/routes";

export function BookingsList({ items }: { items: UserBookingListItemDTO[] }) {
  if (!items.length) {
    return (
      <Card className="rounded-[28px] border border-dashed border-slate-200 bg-white/85 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
        <CardContent className="space-y-4 p-8 text-center">
          <p className="text-xl font-semibold text-slate-950">Belum ada booking</p>
          <p className="text-sm leading-6 text-slate-600">
            Jelajahi vendor favorit Anda lalu buat booking pertama untuk mulai proses acara.
          </p>
          <Button asChild className="h-11 rounded-2xl bg-rose-600 text-white hover:bg-rose-700">
            <Link href={USER_AUTH_ROUTES.vendors}>Cari vendor</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <Card
          key={item.id}
          className="rounded-[28px] border-white/80 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
        >
          <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-lg font-semibold text-slate-950">{item.bookingCode}</p>
                <Badge className={`border ${getBookingStatusBadgeClassName(item.status)}`}>
                  {BOOKING_STATUS_LABELS[item.status]}
                </Badge>
              </div>
              <div>
                <p className="text-base font-medium text-slate-900">{item.vendor.businessName}</p>
                <p className="text-sm text-slate-600">
                  {item.service?.name || "Paket vendor"} · {formatBookingDate(item.eventDate)}
                </p>
                <p className="text-sm text-slate-600">{item.eventLocation}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <p className="text-xl font-semibold text-rose-600">
                {formatBookingPrice(item.totalAmount)}
              </p>
              <Button
                asChild
                className="h-10 rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
              >
                <Link href={`${USER_AUTH_ROUTES.bookings}/${item.id}`}>Lihat detail</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
