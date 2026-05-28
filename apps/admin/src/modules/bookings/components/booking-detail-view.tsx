"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { AdminBookingDetailDTO, BookingStatus, BookingStatusHistoryDTO } from "@wo/shared-types";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
} from "@wo/ui-components";

import { getAvailableBookingActions, getBookingStatusBadgeVariant } from "../constants";
import { bookingsApi } from "../services/bookings-api";
import { BookingHistoryTimeline } from "./booking-history-timeline";

type BookingDetailViewProps = {
  bookingId: string;
};

type ActionState = {
  open: boolean;
  status: BookingStatus | null;
  note: string;
};

type AppToast = {
  id: string;
  title: string;
  description: string;
  tone: "success" | "error";
};

const formatDateTime = (value: Date | string | null | undefined) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getActionCopy = (status: BookingStatus | null) => {
  switch (status) {
    case "PENDING_PAYMENT":
      return {
        title: "Set Pending Payment",
        description: "Lanjutkan booking ke tahap menunggu pembayaran?",
        confirmLabel: "Set Pending Payment",
      };
    case "CONFIRMED":
      return {
        title: "Confirm Booking",
        description: "Konfirmasi booking ini?",
        confirmLabel: "Confirm Booking",
      };
    case "REJECTED":
      return {
        title: "Reject Booking",
        description: "Tolak booking ini? Anda dapat menambahkan catatan penolakan.",
        confirmLabel: "Reject Booking",
      };
    case "COMPLETED":
      return {
        title: "Complete Booking",
        description: "Tandai booking ini sebagai selesai?",
        confirmLabel: "Complete Booking",
      };
    case "CANCELLED":
      return {
        title: "Cancel Booking",
        description: "Batalkan booking ini?",
        confirmLabel: "Cancel Booking",
      };
    default:
      return {
        title: "Update Booking",
        description: "Ubah status booking ini?",
        confirmLabel: "Update",
      };
  }
};

export const BookingDetailView = ({ bookingId }: BookingDetailViewProps) => {
  const [booking, setBooking] = useState<AdminBookingDetailDTO | null>(null);
  const [history, setHistory] = useState<BookingStatusHistoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<ActionState>({
    open: false,
    status: null,
    note: "",
  });
  const [toasts, setToasts] = useState<AppToast[]>([]);

  const addToast = (toast: Omit<AppToast, "id">) => {
    setToasts((current) => [
      ...current,
      {
        ...toast,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
    ]);
  };

  const dismissToast = (id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    let isMounted = true;

    const loadDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await bookingsApi.detail(bookingId);
        if (!isMounted) {
          return;
        }

        setBooking(response);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Gagal memuat detail booking");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDetail();

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      setIsHistoryLoading(true);
      setHistoryError(null);

      try {
        const response = await bookingsApi.history(bookingId);
        if (!isMounted) {
          return;
        }

        setHistory(response);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setHistoryError(
          loadError instanceof Error ? loadError.message : "Gagal memuat timeline booking"
        );
      } finally {
        if (isMounted) {
          setIsHistoryLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  const availableActions = useMemo(
    () => (booking ? getAvailableBookingActions(booking) : []),
    [booking]
  );

  const actionCopy = useMemo(() => getActionCopy(actionState.status), [actionState.status]);

  const openActionDialog = (status: BookingStatus) => {
    setActionState({
      open: true,
      status,
      note: "",
    });
  };

  const closeActionDialog = () => {
    setActionState({
      open: false,
      status: null,
      note: "",
    });
  };

  const submitAction = async () => {
    if (!booking || !actionState.status) {
      return;
    }

    setIsActionLoading(true);

    try {
      const response = await bookingsApi.updateStatus(booking.id, {
        status: actionState.status,
        note: actionState.note,
      });

      setBooking(response);

      try {
        const refreshedHistory = await bookingsApi.history(booking.id);
        setHistory(refreshedHistory);
        setHistoryError(null);
      } catch (historyLoadError) {
        setHistoryError(
          historyLoadError instanceof Error
            ? historyLoadError.message
            : "Gagal memuat timeline booking"
        );
      }

      addToast({
        title: "Status booking diperbarui",
        description: `Booking berhasil diubah ke status ${actionState.status}.`,
        tone: "success",
      });
      closeActionDialog();
    } catch (actionError) {
      addToast({
        title: "Update status gagal",
        description: actionError instanceof Error ? actionError.message : "Aksi tidak dapat diproses",
        tone: "error",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-md border border-border/60 px-4 py-6 text-sm text-muted-foreground">
        Memuat detail booking...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
        <Button variant="outline" asChild>
          <Link href="/bookings">Kembali ke daftar booking</Link>
        </Button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="rounded-md border border-border/60 px-4 py-6 text-sm text-muted-foreground">
        Data booking tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Detail Booking</h1>
          <p className="text-sm text-muted-foreground">
            Booking ID: <span className="font-mono">{booking.id}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/bookings">Kembali</Link>
          </Button>
          {availableActions.map((action) => (
            <Button
              key={action.status}
              variant="ghost"
              onClick={() => openActionDialog(action.status)}
              disabled={isActionLoading}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Booking</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge variant={getBookingStatusBadgeVariant(booking.status)}>{booking.status}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Booking Date</p>
            <p className="font-medium">{formatDateTime(booking.bookedAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Created At</p>
            <p className="font-medium">{formatDateTime(booking.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Updated At</p>
            <p className="font-medium">{formatDateTime(booking.updatedAt)}</p>
          </div>
          <div className="md:col-span-2 xl:col-span-4">
            <p className="text-xs text-muted-foreground">Catatan Booking</p>
            <p className="font-medium">{booking.notes || "-"}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi User</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Nama</p>
              <p className="font-medium">{booking.user.name || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{booking.user.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="font-medium">{booking.user.role}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Akun Aktif</p>
              <p className="font-medium">
                {booking.user.deletedAt || booking.user.suspendedAt ? "Tidak" : "Ya"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Vendor</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Nama Vendor</p>
              <p className="font-medium">{booking.vendor.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status Vendor</p>
              <p className="font-medium">{booking.vendor.status}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Owner</p>
              <p className="font-medium">{booking.vendor.ownerName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Owner Email</p>
              <p className="font-medium">{booking.vendor.ownerEmail || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Kategori</p>
              <p className="font-medium">{booking.vendor.categoryName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vendor Aktif</p>
              <p className="font-medium">
                {booking.vendor.deletedAt || booking.vendor.suspendedAt ? "Tidak" : "Ya"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {booking.service ? (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">Nama</p>
                  <p className="font-medium">{booking.service.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Harga</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat("id-ID").format(booking.service.price)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-medium">{booking.service.isActive ? "Aktif" : "Nonaktif"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Deskripsi</p>
                  <p className="font-medium">{booking.service.description || "-"}</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Service tidak tersedia.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Proof</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {booking.paymentProof ? (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">Uploaded At</p>
                  <p className="font-medium">{formatDateTime(booking.paymentProof.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Verified At</p>
                  <p className="font-medium">{formatDateTime(booking.paymentProof.verifiedAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Catatan</p>
                  <p className="font-medium">{booking.paymentProof.note || "-"}</p>
                </div>
                <Button variant="outline" asChild>
                  <a href={booking.paymentProof.fileUrl} target="_blank" rel="noreferrer">
                    Lihat Bukti Pembayaran
                  </a>
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada bukti pembayaran.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <BookingHistoryTimeline
        bookingCreatedAt={booking.createdAt}
        items={history}
        isLoading={isHistoryLoading}
        error={historyError}
      />

      <Dialog open={actionState.open} onOpenChange={(open) => (open ? undefined : closeActionDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionCopy.title}</DialogTitle>
            <DialogDescription>{actionCopy.description}</DialogDescription>
          </DialogHeader>

          <Input
            value={actionState.note}
            onChange={(event) =>
              setActionState((current) => ({
                ...current,
                note: event.target.value,
              }))
            }
            placeholder="Catatan admin opsional"
          />

          <DialogFooter>
            <Button variant="ghost" onClick={closeActionDialog}>
              Batal
            </Button>
            <Button variant="outline" onClick={() => void submitAction()} disabled={isActionLoading}>
              {isActionLoading ? "Memproses..." : actionCopy.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          open
          onOpenChange={(open) => {
            if (!open) {
              dismissToast(toast.id);
            }
          }}
          duration={2500}
          className={
            toast.tone === "error"
              ? "border-danger/40 bg-danger/10"
              : "border-success/40 bg-success/10"
          }
        >
          <ToastTitle>{toast.title}</ToastTitle>
          <ToastDescription>{toast.description}</ToastDescription>
          <ToastClose />
        </Toast>
      ))}
    </div>
  );
};
