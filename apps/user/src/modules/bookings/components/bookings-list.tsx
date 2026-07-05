import Link from "next/link";
import { Badge, Button, Card, CardContent } from "@wo/ui-components";
import type { PaginatedResult } from "@wo/shared-types";

import type { UserBookingListItemDTO } from "../types";
import {
  BOOKING_SORT_OPTIONS,
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  formatBookingPrice,
  getBookingStatusBadgeClassName,
  getPaymentStatusBadgeClassName,
} from "../constants";
import { formatBookingDate } from "../services/event-date";
import { USER_AUTH_ROUTES } from "@/modules/auth/constants/routes";

type BookingListFilters = {
  page: number;
  limit: number;
  sort: string;
  search?: string;
  bookingStatus?: string;
  paymentStatus?: string;
  eventDateFrom?: string;
  eventDateTo?: string;
};

const buildQueryString = (filters: BookingListFilters, nextPage?: number) => {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.bookingStatus) {
    params.set("bookingStatus", filters.bookingStatus);
  }

  if (filters.paymentStatus) {
    params.set("paymentStatus", filters.paymentStatus);
  }

  if (filters.eventDateFrom) {
    params.set("eventDateFrom", filters.eventDateFrom);
  }

  if (filters.eventDateTo) {
    params.set("eventDateTo", filters.eventDateTo);
  }

  if (filters.sort) {
    params.set("sort", filters.sort);
  }

  params.set("limit", String(filters.limit));
  params.set("page", String(nextPage ?? filters.page));

  return params.toString();
};

const hasFilters = (filters: BookingListFilters) =>
  Boolean(
    filters.search ||
      filters.bookingStatus ||
      filters.paymentStatus ||
      filters.eventDateFrom ||
      filters.eventDateTo ||
      filters.sort !== "newest"
  );

export function BookingsList({
  result,
  filters,
}: {
  result: PaginatedResult<UserBookingListItemDTO>;
  filters: BookingListFilters;
}) {
  const emptyStateMessage = hasFilters(filters)
    ? "Belum ada booking yang cocok dengan pencarian atau filter Anda."
    : "Belum ada booking. Jelajahi vendor favorit Anda lalu buat booking pertama.";

  return (
    <div className="space-y-6">
      <Card className="rounded-[28px] border-white/10 bg-card shadow-2xl">
        <CardContent className="p-5">
          <form action={USER_AUTH_ROUTES.bookings} className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <div className="xl:col-span-2">
              <label className="text-sm font-medium text-slate-300">Cari booking</label>
              <input
                type="text"
                name="search"
                defaultValue={filters.search}
                placeholder="Kode booking, vendor, atau layanan"
                className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-slate-400 outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300">Status booking</label>
              <select
                name="bookingStatus"
                defaultValue={filters.bookingStatus ?? ""}
                className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none focus:border-rose-500"
              >
                <option value="" className="bg-slate-950">Semua status</option>
                {Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value} className="bg-slate-950">
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300">Status pembayaran</label>
              <select
                name="paymentStatus"
                defaultValue={filters.paymentStatus ?? ""}
                className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none focus:border-rose-500"
              >
                <option value="" className="bg-slate-950">Semua status</option>
                {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value} className="bg-slate-950">
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300">Tanggal acara dari</label>
              <input
                type="date"
                name="eventDateFrom"
                defaultValue={filters.eventDateFrom}
                className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300">Tanggal acara sampai</label>
              <input
                type="date"
                name="eventDateTo"
                defaultValue={filters.eventDateTo}
                className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300">Urutkan</label>
              <select
                name="sort"
                defaultValue={filters.sort}
                className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none focus:border-rose-500"
              >
                {BOOKING_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-950">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <input type="hidden" name="limit" value={filters.limit} />
            <input type="hidden" name="page" value="1" />

            <div className="flex flex-wrap gap-3 xl:justify-end">
              <Button type="submit" className="h-11 rounded-2xl bg-rose-600 text-white hover:bg-rose-700">
                Terapkan filter
              </Button>
              <Button asChild type="button" className="h-11 rounded-2xl border-white/10 bg-white/5 text-slate-100 hover:bg-white/10">
                <Link href={USER_AUTH_ROUTES.bookings}>Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {!result.items.length ? (
        <Card className="rounded-[28px] border border-dashed border-white/10 bg-card shadow-2xl">
          <CardContent className="space-y-4 p-8 text-center">
            <p className="text-xl font-semibold text-white">Belum ada hasil booking</p>
            <p className="text-sm leading-6 text-slate-300">{emptyStateMessage}</p>
            <Button asChild className="h-11 rounded-2xl bg-rose-600 text-white hover:bg-rose-700">
              <Link href={USER_AUTH_ROUTES.vendors}>Cari vendor</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {result.items.map((item) => (
            <Card
              key={item.id}
              className="rounded-[28px] border-white/10 bg-card shadow-2xl"
            >
              <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-lg font-semibold text-white">{item.bookingCode}</p>
                    <Badge className={`border ${getBookingStatusBadgeClassName(item.status)}`}>
                      {BOOKING_STATUS_LABELS[item.status]}
                    </Badge>
                    <Badge className={`border ${getPaymentStatusBadgeClassName(item.paymentStatus)}`}>
                      {PAYMENT_STATUS_LABELS[item.paymentStatus]}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-base font-medium text-white">{item.vendor.businessName}</p>
                    <p className="text-sm text-slate-300">
                      {item.service?.name || "Paket vendor"} · {formatBookingDate(item.eventDate)}
                    </p>
                    <p className="text-sm text-slate-300">{item.eventLocation}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:min-w-[220px] lg:items-end">
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total booking</p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      {formatBookingPrice(item.totalAmount)}
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      Sisa pembayaran {formatBookingPrice(item.remainingBalance)}
                    </p>
                  </div>

                  <Button
                    asChild
                    className="h-10 rounded-2xl bg-rose-600 text-white hover:bg-rose-700"
                  >
                    <Link href={`${USER_AUTH_ROUTES.bookings}/${item.id}`}>Lihat detail</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {result.totalPages > 1 ? (
        <Card className="rounded-[28px] border-white/10 bg-card shadow-2xl">
          <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-300">
              Halaman {result.page} dari {result.totalPages} · {result.totalItems} booking
            </p>

            <div className="flex flex-wrap gap-2">
              <Button
                asChild
                className="h-10 rounded-2xl border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                disabled={result.page <= 1}
              >
                <Link
                  href={`${USER_AUTH_ROUTES.bookings}?${buildQueryString(filters, Math.max(result.page - 1, 1))}`}
                >
                  Sebelumnya
                </Link>
              </Button>

              {Array.from({ length: result.totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <Button
                  key={pageNumber}
                  asChild
                  className={`h-10 min-w-10 rounded-2xl ${pageNumber === result.page ? "bg-rose-600 text-white" : "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"}`}
                >
                  <Link href={`${USER_AUTH_ROUTES.bookings}?${buildQueryString(filters, pageNumber)}`}>
                    {pageNumber}
                  </Link>
                </Button>
              ))}

              <Button
                asChild
                className="h-10 rounded-2xl border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                disabled={result.page >= result.totalPages}
              >
                <Link
                  href={`${USER_AUTH_ROUTES.bookings}?${buildQueryString(
                    filters,
                    Math.min(result.page + 1, result.totalPages)
                  )}`}
                >
                  Berikutnya
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
