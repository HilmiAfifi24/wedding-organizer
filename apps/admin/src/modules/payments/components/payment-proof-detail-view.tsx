"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type {
  AdminPaymentProofDetailDTO,
  PaymentProofStatusHistoryDTO,
} from "@wo/shared-types";
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
import { paymentsApi } from "../services/payments-api";
import { PaymentHistoryTimeline } from "./payment-history-timeline";

type PaymentProofDetailViewProps = {
  paymentProofId: string;
};

type ActionType = "force-verify" | "force-reject";

type ActionState = {
  open: boolean;
  type: ActionType | null;
  reason: string;
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

const getActionCopy = (type: ActionType | null) => {
  if (type === "force-verify") {
    return {
      title: "Force Verify Payment",
      description:
        "Admin override ini akan mengubah payment proof menjadi VERIFIED dan booking menjadi CONFIRMED.",
      confirmLabel: "Force Verify",
    };
  }

  return {
    title: "Force Reject Payment",
    description:
      "Admin override ini akan menolak payment proof. Booking akan tetap atau kembali ke PENDING_PAYMENT.",
    confirmLabel: "Force Reject",
  };
};

const isPreviewableImage = (url: string) => /\.(png|jpe?g|gif|webp|svg)$/i.test(url);

export const PaymentProofDetailView = ({ paymentProofId }: PaymentProofDetailViewProps) => {
  const [paymentProof, setPaymentProof] = useState<AdminPaymentProofDetailDTO | null>(null);
  const [history, setHistory] = useState<PaymentProofStatusHistoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<ActionState>({
    open: false,
    type: null,
    reason: "",
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
        const response = await paymentsApi.detail(paymentProofId);
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
        const response = await paymentsApi.history(paymentProofId);
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
    setActionState({
      open: true,
      type,
      reason: "",
    });
  };

  const closeActionDialog = () => {
    setActionState({
      open: false,
      type: null,
      reason: "",
    });
  };

  const submitAction = async () => {
    if (!paymentProof || !actionState.type) {
      return;
    }

    setIsActionLoading(true);

    try {
      const response =
        actionState.type === "force-verify"
          ? await paymentsApi.forceVerify(paymentProof.id, actionState.reason)
          : await paymentsApi.forceReject(paymentProof.id, actionState.reason);

      setPaymentProof(response);

      try {
        const refreshedHistory = await paymentsApi.history(paymentProof.id);
        setHistory(refreshedHistory);
        setHistoryError(null);
      } catch (historyLoadError) {
        setHistoryError(
          historyLoadError instanceof Error
            ? historyLoadError.message
            : "Gagal memuat riwayat verifikasi"
        );
      }

      addToast({
        title: "Override berhasil",
        description:
          actionState.type === "force-verify"
            ? "Payment proof berhasil di-force verify."
            : "Payment proof berhasil di-force reject.",
        tone: "success",
      });
      closeActionDialog();
    } catch (actionError) {
      addToast({
        title: "Override gagal",
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
        Memuat detail payment proof...
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
          <Link href="/payments">Kembali ke daftar pembayaran</Link>
        </Button>
      </div>
    );
  }

  if (!paymentProof) {
    return (
      <div className="rounded-md border border-border/60 px-4 py-6 text-sm text-muted-foreground">
        Data payment proof tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Detail Payment Proof</h1>
          <p className="text-sm text-muted-foreground">
            Payment Proof ID: <span className="font-mono">{paymentProof.id}</span>
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

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Payment Proof</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Status Proof</p>
            <Badge variant={getPaymentProofStatusBadgeVariant(paymentProof.paymentProofStatus)}>
              {paymentProof.paymentProofStatus}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status Booking</p>
            <Badge variant={getBookingStatusBadgeVariant(paymentProof.bookingStatus)}>
              {paymentProof.bookingStatus}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Uploaded At</p>
            <p className="font-medium">{formatDateTime(paymentProof.uploadedAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Updated At</p>
            <p className="font-medium">{formatDateTime(paymentProof.updatedAt)}</p>
          </div>
          <div className="md:col-span-2 xl:col-span-4">
            <p className="text-xs text-muted-foreground">Catatan Upload</p>
            <p className="font-medium">{paymentProof.note || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Verified At</p>
            <p className="font-medium">{formatDateTime(paymentProof.verifiedAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Rejected At</p>
            <p className="font-medium">{formatDateTime(paymentProof.rejectedAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Overridden At</p>
            <p className="font-medium">{formatDateTime(paymentProof.overriddenAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Vendor Verification Status</p>
            <p className="font-medium">{paymentProof.vendor.status}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Preview File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPreviewableImage(paymentProof.fileUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={paymentProof.fileUrl}
                alt="Payment proof preview"
                className="max-h-[420px] w-full rounded-lg border border-border/60 object-contain"
              />
            ) : (
              <div className="rounded-lg border border-border/60 px-4 py-6 text-sm text-muted-foreground">
                Preview inline tidak tersedia untuk file ini.
              </div>
            )}

            <Button variant="outline" asChild>
              <a href={paymentProof.fileUrl} target="_blank" rel="noreferrer">
                Buka File Asli
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verifier & Override</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Verified By</p>
              <p className="font-medium">{paymentProof.verifiedByName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Verification Note</p>
              <p className="font-medium">{paymentProof.verificationNote || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rejected By</p>
              <p className="font-medium">{paymentProof.rejectedByName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rejection Reason</p>
              <p className="font-medium">{paymentProof.rejectionReason || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Overridden By</p>
              <p className="font-medium">{paymentProof.overriddenByName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Override Reason</p>
              <p className="font-medium">{paymentProof.overrideReason || "-"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Related Booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Booking ID</p>
              <p className="font-medium">{paymentProof.booking.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Booking Date</p>
              <p className="font-medium">{formatDateTime(paymentProof.booking.bookedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Service</p>
              <p className="font-medium">{paymentProof.booking.serviceName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Catatan Booking</p>
              <p className="font-medium">{paymentProof.booking.notes || "-"}</p>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/bookings/${paymentProof.booking.id}`}>Lihat Detail Booking</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User & Vendor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">User</p>
              <p className="font-medium">
                {paymentProof.user.name || "-"} - {paymentProof.user.email}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vendor</p>
              <p className="font-medium">
                {paymentProof.vendor.name} - {paymentProof.vendor.ownerEmail || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Owner Vendor</p>
              <p className="font-medium">{paymentProof.vendor.ownerName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Kategori Vendor</p>
              <p className="font-medium">{paymentProof.vendor.categoryName || "-"}</p>
            </div>
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

          <Input
            value={actionState.reason}
            onChange={(event) =>
              setActionState((current) => ({
                ...current,
                reason: event.target.value,
              }))
            }
            placeholder="Override reason wajib diisi"
          />

          <DialogFooter>
            <Button variant="ghost" onClick={closeActionDialog}>
              Batal
            </Button>
            <Button
              variant="outline"
              onClick={() => void submitAction()}
              disabled={isActionLoading || actionState.reason.trim().length < 3}
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
