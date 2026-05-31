"use client";

import { useMemo, useState } from "react";

import type { AdminVendorListItemDTO } from "@wo/shared-types";
import {
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

import { useVendorManagement } from "../hooks/use-vendor-management";
import type { VendorManagementInitialState } from "../hooks/use-vendor-management";
import { VendorsFilterBar } from "./vendors-filter-bar";
import { VendorsTable } from "./vendors-table";

type ActionType = "approve" | "suspend" | "unsuspend" | "delete";

type ConfirmState = {
  open: boolean;
  vendor: AdminVendorListItemDTO | null;
  action: ActionType | null;
};

type RejectState = {
  open: boolean;
  vendor: AdminVendorListItemDTO | null;
  reason: string;
};

type AppToast = {
  id: string;
  title: string;
  description: string;
  tone: "success" | "error";
};

const getActionCopy = (action: ActionType | null, vendorName: string) => {
  if (action === "approve") {
    return {
      title: "Approve Vendor",
      description: `Setujui vendor ${vendorName}?`,
      confirmLabel: "Approve",
    };
  }

  if (action === "suspend") {
    return {
      title: "Suspend Vendor",
      description: `Suspend vendor ${vendorName}? Vendor tidak bisa menerima booking saat suspended.`,
      confirmLabel: "Suspend",
    };
  }

  if (action === "unsuspend") {
    return {
      title: "Unsuspend Vendor",
      description: `Aktifkan kembali vendor ${vendorName}?`,
      confirmLabel: "Unsuspend",
    };
  }

  return {
    title: "Delete Vendor",
    description: `Vendor ${vendorName} akan di-soft delete. Lanjutkan?`,
    confirmLabel: "Delete",
  };
};

type VendorsManagementDashboardProps = {
  initialState?: VendorManagementInitialState;
};

export const VendorsManagementDashboard = ({ initialState }: VendorsManagementDashboardProps) => {
  const {
    items,
    page,
    pageSize,
    totalItems,
    totalPages,
    filters,
    isListLoading,
    isActionLoading,
    error,
    refresh,
    changePage,
    setPageSize,
    updateFilters,
    updateSearch,
    approveVendor,
    rejectVendor,
    suspendVendor,
    unsuspendVendor,
    deleteVendor,
    isEmpty,
  } = useVendorManagement(initialState);

  const [searchDraft, setSearchDraft] = useState(filters.search ?? "");
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    vendor: null,
    action: null,
  });
  const [rejectState, setRejectState] = useState<RejectState>({
    open: false,
    vendor: null,
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

  const openConfirm = (action: ActionType, vendor: AdminVendorListItemDTO) => {
    setConfirmState({
      open: true,
      action,
      vendor,
    });
  };

  const closeConfirm = () => {
    setConfirmState({
      open: false,
      action: null,
      vendor: null,
    });
  };

  const openRejectDialog = (vendor: AdminVendorListItemDTO) => {
    setRejectState({
      open: true,
      vendor,
      reason: "",
    });
  };

  const closeRejectDialog = () => {
    setRejectState({
      open: false,
      vendor: null,
      reason: "",
    });
  };

  const handleApplySearch = () => {
    updateSearch(searchDraft);
  };

  const performAction = async () => {
    const action = confirmState.action;
    const vendor = confirmState.vendor;

    if (!action || !vendor) {
      return;
    }

    try {
      if (action === "approve") {
        await approveVendor(vendor.id);
        addToast({
          title: "Vendor approved",
          description: `Vendor ${vendor.name} berhasil diapprove.`,
          tone: "success",
        });
      }

      if (action === "suspend") {
        await suspendVendor(vendor.id);
        addToast({
          title: "Vendor suspended",
          description: `Vendor ${vendor.name} berhasil disuspend.`,
          tone: "success",
        });
      }

      if (action === "unsuspend") {
        await unsuspendVendor(vendor.id);
        addToast({
          title: "Vendor unsuspended",
          description: `Vendor ${vendor.name} berhasil diunsuspend.`,
          tone: "success",
        });
      }

      if (action === "delete") {
        await deleteVendor(vendor.id);
        addToast({
          title: "Vendor deleted",
          description: `Vendor ${vendor.name} berhasil di-soft delete.`,
          tone: "success",
        });
      }

      closeConfirm();
    } catch (actionError) {
      const message = actionError instanceof Error ? actionError.message : "Aksi gagal diproses";
      addToast({
        title: "Aksi gagal",
        description: message,
        tone: "error",
      });
    }
  };

  const submitReject = async () => {
    if (!rejectState.vendor) {
      return;
    }

    try {
      await rejectVendor(rejectState.vendor.id, rejectState.reason);
      addToast({
        title: "Vendor rejected",
        description: `Vendor ${rejectState.vendor.name} berhasil direject.`,
        tone: "success",
      });
      closeRejectDialog();
    } catch (rejectError) {
      const message = rejectError instanceof Error ? rejectError.message : "Reject vendor gagal";
      addToast({
        title: "Reject gagal",
        description: message,
        tone: "error",
      });
    }
  };

  const actionCopy = useMemo(
    () =>
      getActionCopy(
        confirmState.action,
        confirmState.vendor?.name || confirmState.vendor?.ownerEmail || "vendor"
      ),
    [confirmState.action, confirmState.vendor?.name, confirmState.vendor?.ownerEmail]
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Manajemen Vendor</h1>
        <p className="text-sm text-muted-foreground">
          Kelola verifikasi vendor, status operasional, dan moderasi vendor.
        </p>
      </header>

      {error ? (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <VendorsFilterBar
        filters={filters}
        searchDraft={searchDraft}
        onSearchDraftChange={setSearchDraft}
        onApplySearch={handleApplySearch}
        onFiltersChange={updateFilters}
        onRefresh={() => void refresh()}
        isLoading={isListLoading || isActionLoading}
      />

      <Card>
        <CardHeader>
          <CardTitle>Daftar Vendor</CardTitle>
        </CardHeader>
        <CardContent>
          <VendorsTable
            items={items}
            isLoading={isListLoading}
            isActionLoading={isActionLoading}
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={changePage}
            onPageSizeChange={setPageSize}
            onApprove={(vendor) => openConfirm("approve", vendor)}
            onReject={openRejectDialog}
            onSuspend={(vendor) => openConfirm("suspend", vendor)}
            onUnsuspend={(vendor) => openConfirm("unsuspend", vendor)}
            onDelete={(vendor) => openConfirm("delete", vendor)}
          />
        </CardContent>
      </Card>

      {isEmpty ? (
        <div className="rounded-md border border-border/60 bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          Tidak ada data vendor dengan filter saat ini.
        </div>
      ) : null}

      <Dialog open={confirmState.open} onOpenChange={(open) => (open ? undefined : closeConfirm())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionCopy.title}</DialogTitle>
            <DialogDescription>{actionCopy.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={closeConfirm}>
              Batal
            </Button>
            <Button
              variant="outline"
              className={confirmState.action === "delete" ? "text-danger" : undefined}
              onClick={() => void performAction()}
              disabled={isActionLoading}
            >
              {isActionLoading ? "Memproses..." : actionCopy.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectState.open} onOpenChange={(open) => (open ? undefined : closeRejectDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Vendor</DialogTitle>
            <DialogDescription>
              Alasan reject wajib diisi dan akan disimpan sebagai audit reason.
            </DialogDescription>
          </DialogHeader>

          <Input
            value={rejectState.reason}
            onChange={(event) => setRejectState((current) => ({ ...current, reason: event.target.value }))}
            placeholder="Masukkan alasan reject"
          />

          <DialogFooter>
            <Button variant="ghost" onClick={closeRejectDialog}>
              Batal
            </Button>
            <Button
              variant="outline"
              onClick={() => void submitReject()}
              disabled={isActionLoading || rejectState.reason.trim().length < 3}
            >
              {isActionLoading ? "Menyimpan..." : "Reject Vendor"}
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
