"use client";

import type { AdminUserDetailDTO } from "@wo/shared-types";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@wo/ui-components";

type UserDetailDialogProps = {
  open: boolean;
  user: AdminUserDetailDTO | null;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadHistory: () => void;
  isHistoryLoading: boolean;
  historyError: string | null;
};

const formatDateTime = (value: Date | string | null | undefined) => {
  if (!value) {
    return "-";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const statusBadgeVariant = (status: AdminUserDetailDTO["status"]) => {
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

const bookingBadgeVariant = (status: AdminUserDetailDTO["bookings"][number]["status"]) => {
  switch (status) {
    case "CONFIRMED":
    case "COMPLETED":
      return "success" as const;
    case "REJECTED":
    case "CANCELLED":
      return "danger" as const;
    case "PENDING_PAYMENT":
      return "warning" as const;
    default:
      return "outline" as const;
  }
};

export const UserDetailDialog = ({
  open,
  user,
  isLoading,
  onOpenChange,
  onLoadHistory,
  isHistoryLoading,
  historyError,
}: UserDetailDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(96vw,980px)] max-w-none">
        <DialogHeader>
          <DialogTitle>Detail User</DialogTitle>
          <DialogDescription>
            Informasi profil user dan riwayat booking.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="rounded-md border border-border/60 px-4 py-6 text-sm text-muted-foreground">
            Memuat detail user...
          </div>
        ) : !user ? (
          <div className="rounded-md border border-border/60 px-4 py-6 text-sm text-muted-foreground">
            Data user tidak tersedia.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 rounded-md border border-border/60 p-4 md:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Nama</p>
                <p className="font-medium">{user.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <Badge variant="outline">{user.role}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant={statusBadgeVariant(user.status)}>{user.status}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Profil Akses</p>
                <p className="font-medium">{user.accessProfileName || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Terakhir Update</p>
                <p className="font-medium">{formatDateTime(user.updatedAt)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Riwayat Booking</h3>
                <Button variant="outline" size="sm" onClick={onLoadHistory} disabled={isHistoryLoading}>
                  {isHistoryLoading ? "Memuat..." : "Muat Riwayat"}
                </Button>
              </div>

              {historyError ? (
                <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                  {historyError}
                </div>
              ) : null}

              <div className="max-h-[320px] overflow-auto rounded-md border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Layanan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.bookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Belum ada data booking.
                        </TableCell>
                      </TableRow>
                    ) : (
                      user.bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>{formatDateTime(booking.bookedAt)}</TableCell>
                          <TableCell>
                            <Badge variant={bookingBadgeVariant(booking.status)}>{booking.status}</Badge>
                          </TableCell>
                          <TableCell>{booking.vendorName}</TableCell>
                          <TableCell>{booking.serviceName || "-"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
