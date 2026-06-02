"use client";

import Link from "next/link";

import type { VendorPaymentListItemDTO } from "@/core/application/dto/payments/vendor-payment-management-dto";
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

import { getBookingStatusBadgeVariant, getPaymentProofStatusBadgeVariant } from "../constants";

type PaymentsTableProps = {
  items: VendorPaymentListItemDTO[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

const formatDateTime = (value: Date | string | null | undefined) => {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const formatCurrency = (value: number | null | undefined) => {
  if (typeof value !== "number") {
    return "-";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

export const PaymentsTable = ({
  items,
  isLoading,
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: PaymentsTableProps) => {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/10 bg-slate-950/65">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Status Proof</TableHead>
              <TableHead>Status Booking</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Memuat payment proof...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Tidak ada payment proof.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium">{item.bookingId.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(item.bookingDate)}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{item.customerName || "-"}</p>
                    <p className="text-xs text-muted-foreground">{item.customerEmail}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{formatCurrency(item.totalAmount)}</p>
                    <p className="text-xs text-muted-foreground">{item.serviceName || "-"}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPaymentProofStatusBadgeVariant(item.paymentProofStatus)}>
                      {item.paymentProofStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBookingStatusBadgeVariant(item.bookingStatus)}>
                      {item.bookingStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(item.uploadedAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/payments/${item.id}`}>Detail</Link>
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
        <p className="text-sm text-slate-300">
          Menampilkan {items.length} dari {totalItems} payment proof
        </p>

        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-md border border-white/20 bg-transparent px-2 text-sm"
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
          <span className="px-2 text-sm text-slate-300">
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
