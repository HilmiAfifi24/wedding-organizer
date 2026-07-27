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
import { vendorBookingsApi } from "../services/bookings-api";
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
        title: "Accept Booking",
        description: "Terima booking dan lanjutkan ke tahap pembayaran?",
        confirmLabel: "Accept Booking",
      };
    case "REJECTED":
      return {
        title: "Reject Booking",
        description: "Tolak booking ini?",
        confirmLabel: "Reject Booking",
      };
    case "CONFIRMED":
      return {
        title: "Verify Payment",
        description: "Verifikasi payment proof lalu konfirmasi booking ini?",
        confirmLabel: "Verify Payment",
      };
    case "COMPLETED":
      return {
        title: "Mark Completed",
        description: "Tandai booking ini sebagai selesai?",
        confirmLabel: "Mark Completed",
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
        const response = await vendorBookingsApi.detail(bookingId);
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
        const response = await vendorBookingsApi.history(bookingId);
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
      const response = await vendorBookingsApi.updateStatus(booking.id, {
        status: actionState.status,
        note: actionState.note,
      });

      setBooking(response);

      try {
        const refreshedHistory = await vendorBookingsApi.history(booking.id);
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
      <div className="rounded-xl border border-white/10 bg-slate-950/65 px-4 py-6 text-sm text-slate-300">
        Memuat detail booking...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
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
      <div className="rounded-xl border border-white/10 bg-slate-950/65 px-4 py-6 text-sm text-slate-300">
        Data booking tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Detail Booking</h1>
          <p className="text-sm text-slate-300">
            Booking Code: <span className="font-mono">{booking.id}</span>
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

      <Card className="border border-white/10 bg-slate-950/65 text-slate-100">
        <CardHeader>
          <CardTitle>Informasi Booking</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-xs text-slate-400">Status</p>
            <Badge variant={getBookingStatusBadgeVariant(booking.status)}>{booking.status}</Badge>
          </div>
          <div>
            <p className="text-xs text-slate-400">Tipe Paket</p>
            <Badge
              variant="outline"
              className={
                booking.specialRequest
                  ? "border-purple-500/30 bg-purple-500/10 text-purple-400"
                  : "border-slate-700 bg-slate-800 text-slate-400"
              }
            >
              {booking.specialRequest ? "Kustom Karakteristik" : "Paket Dasar"}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-slate-400">Booking Date</p>
            <p className="font-medium">{formatDateTime(booking.bookedAt)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Event Date</p>
            <p className="font-medium">-</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Event Location</p>
            <p className="font-medium">-</p>
          </div>
          <div className="md:col-span-2 xl:col-span-4">
            <p className="text-xs text-slate-400">Notes</p>
            <p className="font-medium">{booking.notes || "-"}</p>
          </div>
          {booking.specialRequest && (
            <div className="md:col-span-2 xl:col-span-4">
              <p className="text-xs text-slate-400">Permintaan Karakteristik Khusus</p>
              <p className="font-medium text-purple-300">{booking.specialRequest}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border border-white/10 bg-slate-950/65 text-slate-100">
          <CardHeader>
            <CardTitle>Informasi Customer</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs text-slate-400">Nama</p>
              <p className="font-medium">{booking.user.name || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Email</p>
              <p className="font-medium">{booking.user.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Phone</p>
              <p className="font-medium">-</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-slate-950/65 text-slate-100">
          <CardHeader>
            <CardTitle>Informasi Service</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {booking.service ? (
              <>
                <div>
                  <p className="text-xs text-slate-400">Nama Service</p>
                  <p className="font-medium">{booking.service.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Kategori Service</p>
                  <p className="font-medium">{booking.vendor.categoryName || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Harga</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(booking.service.price)}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">Service sudah tidak tersedia.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-white/10 bg-slate-950/65 text-slate-100">
        <CardHeader>
          <CardTitle>Informasi Payment</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {booking.paymentProof ? (
            <>
              <div>
                <p className="text-xs text-slate-400">Payment Status</p>
                <p className="font-medium">{booking.paymentProof.status}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Uploaded At</p>
                <p className="font-medium">{formatDateTime(booking.paymentProof.createdAt)}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-slate-400">Payment Proof</p>
                <a
                  href={booking.paymentProof.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-cyan-300 underline-offset-4 hover:underline"
                >
                  Lihat Payment Proof
                </a>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400">Customer belum mengunggah payment proof.</p>
          )}
        </CardContent>
      </Card>

      <BookingHistoryTimeline
        bookingCreatedAt={booking.createdAt}
        items={history}
        isLoading={isHistoryLoading}
        error={historyError}
      />

      <Dialog open={actionState.open} onOpenChange={(open) => (open ? null : closeActionDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionCopy.title}</DialogTitle>
            <DialogDescription>{actionCopy.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label htmlFor="booking-note" className="text-sm font-medium">
              Catatan (opsional)
            </label>
            <Input
              id="booking-note"
              value={actionState.note}
              onChange={(event) =>
                setActionState((current) => ({
                  ...current,
                  note: event.target.value,
                }))
              }
              placeholder="Tambahkan catatan untuk perubahan status"
              maxLength={500}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeActionDialog} disabled={isActionLoading}>
              Batal
            </Button>
            <Button onClick={() => void submitAction()} disabled={isActionLoading}>
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
