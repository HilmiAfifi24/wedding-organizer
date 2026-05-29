"use client";

import Link from "next/link";

import type { AdminPaymentProofListItemDTO } from "@wo/shared-types";
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
  items: AdminPaymentProofListItemDTO[];
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
      <div className="rounded-lg border border-border/60 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Vendor</TableHead>
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
                    <p className="font-medium">{item.bookingId.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(item.uploadedAt)}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{item.userName || "-"}</p>
                    <p className="text-xs text-muted-foreground">{item.userEmail}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{item.vendorName}</p>
                    <p className="text-xs text-muted-foreground">{item.vendorStatus}</p>
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
        <p className="text-sm text-muted-foreground">
          Menampilkan {items.length} dari {totalItems} payment proof
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
