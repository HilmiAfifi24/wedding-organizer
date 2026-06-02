"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type {
  VendorPaymentDetailDTO,
} from "@/core/application/dto/payments/vendor-payment-management-dto";
import type { PaymentProofStatusHistoryDTO } from "@wo/shared-types";
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

import {
  getAvailablePaymentActions,
  getBookingStatusBadgeVariant,
  getPaymentProofStatusBadgeVariant,
} from "../constants";
import { vendorPaymentsApi } from "../services/payments-api";
import { PaymentHistoryTimeline } from "./payment-history-timeline";

type PaymentProofDetailViewProps = {
  paymentProofId: string;
};

type ActionType = "verify" | "reject";

type ActionState = {
  open: boolean;
  type: ActionType | null;
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

const getActionCopy = (type: ActionType | null) => {
  if (type === "verify") {
    return {
      title: "Verify Payment",
      description:
        "Pembayaran akan ditandai VERIFIED dan booking otomatis berubah menjadi CONFIRMED.",
      confirmLabel: "Verify Payment",
      placeholder: "Catatan verifikasi opsional",
      required: false,
    };
  }

  return {
    title: "Reject Payment",
    description:
      "Penolakan wajib memiliki alasan yang jelas agar customer dapat mengunggah ulang bukti pembayaran.",
    confirmLabel: "Reject Payment",
    placeholder: "Tuliskan alasan penolakan",
    required: true,
  };
};

const isImageFile = (url: string) => /\.(png|jpe?g|gif|webp|svg)$/i.test(url) || url.startsWith("data:image/");
const isPdfFile = (url: string) => /\.pdf$/i.test(url) || url.startsWith("data:application/pdf");

export const PaymentProofDetailView = ({ paymentProofId }: PaymentProofDetailViewProps) => {
  const [paymentProof, setPaymentProof] = useState<VendorPaymentDetailDTO | null>(null);
  const [history, setHistory] = useState<PaymentProofStatusHistoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<ActionState>({
    open: false,
    type: null,
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
        const response = await vendorPaymentsApi.detail(paymentProofId);
        if (!isMounted) {
          return;
        }

        setPaymentProof(response);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Gagal memuat detail payment proof");
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
  }, [paymentProofId]);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      setIsHistoryLoading(true);
      setHistoryError(null);

      try {
        const response = await vendorPaymentsApi.history(paymentProofId);
        if (!isMounted) {
          return;
        }

        setHistory(response);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setHistoryError(
          loadError instanceof Error ? loadError.message : "Gagal memuat riwayat verifikasi"
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
  }, [paymentProofId]);

  const availableActions = useMemo(
    () => (paymentProof ? getAvailablePaymentActions(paymentProof) : []),
    [paymentProof]
  );

  const actionCopy = useMemo(() => getActionCopy(actionState.type), [actionState.type]);

  const openActionDialog = (type: ActionType) => {
    setActionState({ open: true, type, note: "" });
  };

  const closeActionDialog = () => {
    setActionState({ open: false, type: null, note: "" });
  };

  const reloadHistory = async (id: string) => {
    try {
      const refreshedHistory = await vendorPaymentsApi.history(id);
      setHistory(refreshedHistory);
      setHistoryError(null);
    } catch (historyLoadError) {
      setHistoryError(
        historyLoadError instanceof Error
          ? historyLoadError.message
          : "Gagal memuat riwayat verifikasi"
      );
    }
  };

  const submitAction = async () => {
    if (!paymentProof || !actionState.type) {
      return;
    }

    setIsActionLoading(true);

    try {
      const response =
        actionState.type === "verify"
          ? await vendorPaymentsApi.verify(paymentProof.id, actionState.note)
          : await vendorPaymentsApi.reject(paymentProof.id, actionState.note);

      setPaymentProof(response);
      await reloadHistory(paymentProof.id);

      addToast({
        title: "Aksi berhasil",
        description:
          actionState.type === "verify"
            ? "Payment proof berhasil diverifikasi dan booking dikonfirmasi."
            : "Payment proof berhasil ditolak.",
        tone: "success",
      });
      closeActionDialog();
    } catch (actionError) {
      addToast({
        title: "Aksi gagal",
        description: actionError instanceof Error ? actionError.message : "Aksi tidak dapat diproses",
        tone: "error",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-white/10 px-4 py-6 text-sm text-slate-400">
        Memuat detail payment proof...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
        <Button variant="outline" asChild>
          <Link href="/payments">Kembali ke daftar pembayaran</Link>
        </Button>
      </div>
    );
  }

  if (!paymentProof) {
    return (
      <div className="rounded-lg border border-white/10 px-4 py-6 text-sm text-slate-400">
        Data payment proof tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Detail Payment Proof</h1>
          <p className="text-sm text-slate-400">
            Proof ID: <span className="font-mono">{paymentProof.id}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/payments">Kembali</Link>
          </Button>
          {availableActions.map((action) => (
            <Button
              key={action.type}
              variant="ghost"
              onClick={() => openActionDialog(action.type)}
              disabled={isActionLoading}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      <Card className="border border-white/10 bg-slate-950/65 text-slate-100">
        <CardHeader>
          <CardTitle>Ringkasan Pembayaran</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-xs text-slate-400">Status Proof</p>
            <Badge variant={getPaymentProofStatusBadgeVariant(paymentProof.paymentProofStatus)}>
              {paymentProof.paymentProofStatus}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-slate-400">Status Booking</p>
            <Badge variant={getBookingStatusBadgeVariant(paymentProof.bookingStatus)}>
              {paymentProof.bookingStatus}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-slate-400">Uploaded At</p>
            <p className="font-medium">{formatDateTime(paymentProof.uploadedAt)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Nominal</p>
            <p className="font-medium">{formatCurrency(paymentProof.booking.totalAmount)}</p>
          </div>
          <div className="md:col-span-2 xl:col-span-4">
            <p className="text-xs text-slate-400">Catatan Upload</p>
            <p className="font-medium">{paymentProof.note || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Verified At</p>
            <p className="font-medium">{formatDateTime(paymentProof.verifiedAt)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Rejected At</p>
            <p className="font-medium">{formatDateTime(paymentProof.rejectedAt)}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-slate-400">Verification Note</p>
            <p className="font-medium">{paymentProof.verificationNote || "-"}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-slate-400">Rejection Reason</p>
            <p className="font-medium">{paymentProof.rejectionReason || "-"}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border border-white/10 bg-slate-950/65 text-slate-100">
          <CardHeader>
            <CardTitle>Preview File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isImageFile(paymentProof.fileUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={paymentProof.fileUrl}
                alt="Payment proof preview"
                className="max-h-[420px] w-full rounded-lg border border-white/10 object-contain"
              />
            ) : isPdfFile(paymentProof.fileUrl) ? (
              <iframe
                src={paymentProof.fileUrl}
                title="Payment proof PDF preview"
                className="h-[480px] w-full rounded-lg border border-white/10 bg-white"
              />
            ) : (
              <div className="rounded-lg border border-white/10 px-4 py-6 text-sm text-slate-400">
                Preview inline tidak tersedia untuk file ini.
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <a href={paymentProof.fileUrl} target="_blank" rel="noreferrer">
                  Buka Full Size
                </a>
              </Button>
              <Button variant="ghost" asChild>
                <a href={paymentProof.fileUrl} download>
                  Download Proof
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-slate-950/65 text-slate-100">
          <CardHeader>
            <CardTitle>Customer & Booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-slate-400">Customer</p>
              <p className="font-medium">{paymentProof.user.name || "-"}</p>
              <p className="text-sm text-slate-400">{paymentProof.user.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Phone</p>
              <p className="font-medium">{paymentProof.user.phone || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Booking Code</p>
              <p className="font-medium">{paymentProof.booking.id}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Booking Date</p>
              <p className="font-medium">{formatDateTime(paymentProof.booking.bookedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Service</p>
              <p className="font-medium">{paymentProof.booking.serviceName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Package</p>
              <p className="font-medium">{paymentProof.booking.packageName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Amount</p>
              <p className="font-medium">{formatCurrency(paymentProof.booking.totalAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Booking Note</p>
              <p className="font-medium">{paymentProof.booking.notes || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Verifier</p>
              <p className="font-medium">{paymentProof.verifiedByName || paymentProof.rejectedByName || "-"}</p>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/bookings/${paymentProof.booking.id}`}>Lihat Detail Booking</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <PaymentHistoryTimeline
        uploadedAt={paymentProof.uploadedAt}
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

          {actionState.type === "verify" ? (
            <Input
              value={actionState.note}
              onChange={(event) =>
                setActionState((current) => ({
                  ...current,
                  note: event.target.value,
                }))
              }
              placeholder={actionCopy.placeholder}
            />
          ) : (
            <textarea
              value={actionState.note}
              onChange={(event) =>
                setActionState((current) => ({
                  ...current,
                  note: event.target.value,
                }))
              }
              placeholder={actionCopy.placeholder}
              className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={closeActionDialog}>
              Batal
            </Button>
            <Button
              variant="outline"
              onClick={() => void submitAction()}
              disabled={
                isActionLoading ||
                (actionCopy.required && actionState.note.trim().length < 3)
              }
            >
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
