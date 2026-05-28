"use client";

import type { AdminUserListItemDTO } from "@wo/shared-types";
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@wo/ui-components";

type UsersTableProps = {
  currentUserId: string;
  items: AdminUserListItemDTO[];
  isLoading: boolean;
  isActionLoading: boolean;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onViewDetail: (userId: string) => void;
  onSuspend: (user: AdminUserListItemDTO) => void;
  onUnsuspend: (user: AdminUserListItemDTO) => void;
  onDelete: (user: AdminUserListItemDTO) => void;
};

const statusBadgeVariant = (status: AdminUserListItemDTO["status"]) => {
  switch (status) {
    case "ACTIVE":
      return "success" as const;
    case "SUSPENDED":
      return "warning" as const;
    case "DELETED":
      return "danger" as const;
    default:
      return "outline" as const;
  }
};

export const UsersTable = ({
  currentUserId,
  items,
  isLoading,
  isActionLoading,
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onViewDetail,
  onSuspend,
  onUnsuspend,
  onDelete,
}: UsersTableProps) => {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border/60 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama / Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Profile Akses</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Memuat data user...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Tidak ada user.
                </TableCell>
              </TableRow>
            ) : (
              items.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <p className="font-medium">{user.name || "-"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(user.status)}>{user.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {user.accessProfileName ? (
                      <p className="text-sm">{user.accessProfileName}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">-</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewDetail(user.id)}
                        disabled={isActionLoading}
                      >
                        Detail
                      </Button>

                      {user.status === "SUSPENDED" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onUnsuspend(user)}
                          disabled={isActionLoading || user.id === currentUserId}
                        >
                          Unsuspend
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onSuspend(user)}
                          disabled={
                            isActionLoading || user.status === "DELETED" || user.id === currentUserId
                          }
                        >
                          Suspend
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-danger"
                        onClick={() => onDelete(user)}
                        disabled={
                          isActionLoading || user.status === "DELETED" || user.id === currentUserId
                        }
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
          Menampilkan {items.length} dari {totalItems} user
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
