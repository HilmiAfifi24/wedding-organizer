"use client";

import Link from "next/link";

import type { AdminBookingListItemDTO } from "@wo/shared-types";
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@wo/ui-components";

import { getBookingStatusBadgeVariant } from "../constants";

type BookingsTableProps = {
  items: AdminBookingListItemDTO[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

const formatDateTime = (value: Date | string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const BookingsTable = ({
  items,
  isLoading,
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: BookingsTableProps) => {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border/60 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pembayaran</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Memuat data booking...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Tidak ada booking.
                </TableCell>
              </TableRow>
            ) : (
              items.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <p className="font-medium">{booking.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(booking.bookedAt)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{booking.userName || "-"}</p>
                    <p className="text-xs text-muted-foreground">{booking.userEmail}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{booking.vendorName}</p>
                    <p className="text-xs text-muted-foreground">{booking.vendorStatus}</p>
                  </TableCell>
                  <TableCell>{booking.serviceName || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={getBookingStatusBadgeVariant(booking.status)}>{booking.status}</Badge>
                  </TableCell>
                  <TableCell>{booking.hasPaymentProof ? "Ada" : "Belum"}</TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/bookings/${booking.id}`}>Detail</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          Menampilkan {items.length} dari {totalItems} booking
        </p>

        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-md border border-border bg-transparent px-2 text-sm"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} / halaman
              </option>
            ))}
          </select>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
          >
            Prev
          </Button>
          <span className="px-2 text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
