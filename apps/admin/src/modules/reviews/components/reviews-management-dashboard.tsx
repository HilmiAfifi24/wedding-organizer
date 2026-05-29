"use client";

import { useState } from "react";

import type { AdminReviewListItemDTO } from "@wo/shared-types";
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

import { useReviewModeration } from "../hooks/use-review-moderation";
import { ReviewsFilterBar } from "./reviews-filter-bar";
import { ReviewsTable } from "./reviews-table";

type ActionType = "hide" | "unhide" | "delete";

type ActionState = {
  open: boolean;
  review: AdminReviewListItemDTO | null;
  action: ActionType | null;
  reason: string;
};

type AppToast = {
  id: string;
  title: string;
  description: string;
  tone: "success" | "error";
};

const getActionCopy = (action: ActionType | null, reviewerName: string) => {
  if (action === "hide") {
    return {
      title: "Hide Review",
      description: `Sembunyikan review dari ${reviewerName}? Reason wajib diisi.`,
      confirmLabel: "Hide Review",
      requireReason: true,
    };
  }

  if (action === "delete") {
    return {
      title: "Delete Review",
      description: `Soft delete review dari ${reviewerName}? Reason wajib diisi.`,
      confirmLabel: "Delete Review",
      requireReason: true,
    };
  }

  return {
    title: "Unhide Review",
    description: `Tampilkan kembali review dari ${reviewerName}?`,
    confirmLabel: "Unhide Review",
    requireReason: false,
  };
};

export const ReviewsManagementDashboard = () => {
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
    hideReview,
    unhideReview,
    deleteReview,
    isEmpty,
  } = useReviewModeration();

  const [searchDraft, setSearchDraft] = useState(filters.search ?? "");
  const [vendorDraft, setVendorDraft] = useState(filters.vendor ?? "");
  const [actionState, setActionState] = useState<ActionState>({
    open: false,
    review: null,
    action: null,
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

  const applyFilters = () => {
    updateSearch(searchDraft);
    updateFilters({
      vendor: vendorDraft.trim() || undefined,
    });
  };

  const openAction = (action: ActionType, review: AdminReviewListItemDTO) => {
    setActionState({
      open: true,
      action,
      review,
      reason: "",
    });
  };

  const closeAction = () => {
    setActionState({
      open: false,
      action: null,
      review: null,
      reason: "",
    });
  };

  const actionCopy = getActionCopy(
    actionState.action,
    actionState.review?.reviewerName || actionState.review?.reviewerEmail || "reviewer"
  );

  const submitAction = async () => {
    const action = actionState.action;
    const review = actionState.review;

    if (!action || !review) {
      return;
    }

    try {
      if (action === "hide") {
        await hideReview(review.id, actionState.reason);
        addToast({
          title: "Review hidden",
          description: "Review berhasil disembunyikan.",
          tone: "success",
        });
      }

      if (action === "unhide") {
        await unhideReview(review.id, actionState.reason);
        addToast({
          title: "Review unhidden",
          description: "Review berhasil ditampilkan kembali.",
          tone: "success",
        });
      }

      if (action === "delete") {
        await deleteReview(review.id, actionState.reason);
        addToast({
          title: "Review deleted",
          description: "Review berhasil di-soft delete.",
          tone: "success",
        });
      }

      closeAction();
    } catch (actionError) {
      addToast({
        title: "Aksi gagal",
        description: actionError instanceof Error ? actionError.message : "Aksi tidak dapat diproses",
        tone: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Moderasi Review</h1>
        <p className="text-sm text-muted-foreground">
          Moderasi review user yang spam, tidak pantas, atau bermasalah tanpa menyentuh data publik secara langsung.
        </p>
      </header>

      {error ? (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <ReviewsFilterBar
        filters={filters}
        searchDraft={searchDraft}
        vendorDraft={vendorDraft}
        onSearchDraftChange={setSearchDraft}
        onVendorDraftChange={setVendorDraft}
        onApplyFilters={applyFilters}
        onFiltersChange={updateFilters}
        onRefresh={() => void refresh()}
        isLoading={isListLoading || isActionLoading}
      />

      <Card>
        <CardHeader>
          <CardTitle>Daftar Review</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewsTable
            items={items}
            isLoading={isListLoading}
            isActionLoading={isActionLoading}
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={changePage}
            onPageSizeChange={setPageSize}
            onHide={(review) => openAction("hide", review)}
            onUnhide={(review) => openAction("unhide", review)}
            onDelete={(review) => openAction("delete", review)}
          />
        </CardContent>
      </Card>

      {isEmpty ? (
        <div className="rounded-md border border-border/60 bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          Tidak ada review dengan filter saat ini.
        </div>
      ) : null}

      <Dialog open={actionState.open} onOpenChange={(open) => (open ? undefined : closeAction())}>
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
            placeholder={
              actionCopy.requireReason
                ? "Moderation reason wajib diisi"
                : "Reason opsional"
            }
          />

          <DialogFooter>
            <Button variant="ghost" onClick={closeAction}>
              Batal
            </Button>
            <Button
              variant="outline"
              onClick={() => void submitAction()}
              disabled={isActionLoading || (actionCopy.requireReason && actionState.reason.trim().length < 3)}
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
