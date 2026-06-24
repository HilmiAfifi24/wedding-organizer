"use client";

import Link from "next/link";

import type { AdminVendorListItemDTO } from "@wo/shared-types";
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@wo/ui-components";

type VendorsTableProps = {
  items: AdminVendorListItemDTO[];
  isLoading: boolean;
  isActionLoading: boolean;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onApprove: (vendor: AdminVendorListItemDTO) => void;
  onReject: (vendor: AdminVendorListItemDTO) => void;
  onSuspend: (vendor: AdminVendorListItemDTO) => void;
  onUnsuspend: (vendor: AdminVendorListItemDTO) => void;
  onDelete: (vendor: AdminVendorListItemDTO) => void;
};

const statusBadgeVariant = (status: AdminVendorListItemDTO["status"]) => {
  switch (status) {
    case "approved":
      return "success" as const;
    case "pending_verification":
      return "warning" as const;
    case "rejected":
      return "danger" as const;
    case "suspended":
      return "outline" as const;
    default:
      return "outline" as const;
  }
};

export const VendorsTable = ({
  items,
  isLoading,
  isActionLoading,
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onApprove,
  onReject,
  onSuspend,
  onUnsuspend,
  onDelete,
}: VendorsTableProps) => {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border/60 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Memuat data vendor...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Tidak ada vendor.
                </TableCell>
              </TableRow>
            ) : (
              items.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell>
                    <p className="font-medium">{vendor.name}</p>
                    <p className="text-xs text-muted-foreground">{vendor.phoneNumber || "-"}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{vendor.ownerName || "-"}</p>
                    <p className="text-xs text-muted-foreground">{vendor.ownerEmail}</p>
                  </TableCell>
                  <TableCell>{vendor.categoryName || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(vendor.status)}>{vendor.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/vendors/${vendor.id}`}>Detail</Link>
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onApprove(vendor)}
                        disabled={isActionLoading || vendor.status === "approved" || Boolean(vendor.deletedAt)}
                      >
                        Approve
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onReject(vendor)}
                        disabled={isActionLoading || Boolean(vendor.deletedAt)}
                      >
                        Reject
                      </Button>

                      {vendor.status === "suspended" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onUnsuspend(vendor)}
                          disabled={isActionLoading || Boolean(vendor.deletedAt)}
                        >
                          Unsuspend
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onSuspend(vendor)}
                          disabled={isActionLoading || Boolean(vendor.deletedAt)}
                        >
                          Suspend
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-danger"
                        onClick={() => onDelete(vendor)}
                        disabled={isActionLoading || Boolean(vendor.deletedAt)}
                      >
                        Delete
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
          Menampilkan {items.length} dari {totalItems} vendor
        </p>

        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-2 focus:ring-offset-background"
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
