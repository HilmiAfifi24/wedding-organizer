"use client";

import Link from "next/link";

import type { AdminAuditLogListItemDTO } from "@wo/shared-types";
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

import {
  formatAuditModuleLabel,
  getAuditActionBadgeVariant,
  getAuditModuleBadgeVariant,
} from "../constants";

type AuditLogsTableProps = {
  items: AdminAuditLogListItemDTO[];
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

export const AuditLogsTable = ({
  items,
  isLoading,
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: AuditLogsTableProps) => {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border/60 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Actor</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Context</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Memuat audit log...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Tidak ada audit log.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium">{item.actorName || "Admin"}</p>
                    <p className="text-xs text-muted-foreground">{item.actorEmail}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getAuditModuleBadgeVariant(item.module)}>
                      {formatAuditModuleLabel(item.module)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getAuditActionBadgeVariant(item.action)}>{item.action}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="font-mono text-xs">{item.targetId}</p>
                    {item.targetPath ? (
                      <p className="text-xs text-muted-foreground">{item.targetPath}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Tanpa target route</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-muted-foreground">
                      {item.ipAddress ? `IP ${item.ipAddress}` : "IP tidak tersedia"}
                    </p>
                    <p className="line-clamp-1 max-w-[240px] text-xs text-muted-foreground">
                      {item.userAgent || "User agent tidak tersedia"}
                    </p>
                  </TableCell>
                  <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/audit-logs/${item.id}`}>Detail</Link>
                      </Button>
                      {item.targetPath ? (
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={item.targetPath}>Buka Target</Link>
                        </Button>
                      ) : null}
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
          Menampilkan {items.length} dari {totalItems} audit log
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
