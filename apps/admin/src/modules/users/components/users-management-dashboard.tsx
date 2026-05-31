"use client";

import { useMemo, useState } from "react";

import type { AdminUserListItemDTO } from "@wo/shared-types";
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
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
} from "@wo/ui-components";

import { useUserManagement } from "../hooks/use-user-management";
import type { UserManagementInitialState } from "../hooks/use-user-management";
import { UserDetailDialog } from "./user-detail-dialog";
import { UsersFilterBar } from "./users-filter-bar";
import { UsersTable } from "./users-table";

type UsersManagementDashboardProps = {
  currentUserId: string;
  initialState?: UserManagementInitialState;
};

type ActionType = "suspend" | "unsuspend" | "delete";

type ConfirmState = {
  open: boolean;
  user: AdminUserListItemDTO | null;
  action: ActionType | null;
};

type AppToast = {
  id: string;
  title: string;
  description: string;
  tone: "success" | "error";
};

const getActionCopy = (action: ActionType | null, userName: string) => {
  if (action === "suspend") {
    return {
      title: "Suspend User",
      description: `Apakah Anda yakin ingin suspend user ${userName}?`,
      confirmLabel: "Suspend",
    };
  }

  if (action === "unsuspend") {
    return {
      title: "Unsuspend User",
      description: `Apakah Anda yakin ingin mengaktifkan kembali user ${userName}?`,
      confirmLabel: "Unsuspend",
    };
  }

  return {
    title: "Delete User",
    description: `User ${userName} akan di-soft delete. Lanjutkan?`,
    confirmLabel: "Delete",
  };
};

export const UsersManagementDashboard = ({
  currentUserId,
  initialState,
}: UsersManagementDashboardProps) => {
  const {
    items,
    page,
    pageSize,
    totalItems,
    totalPages,
    filters,
    isListLoading,
    isDetailLoading,
    isActionLoading,
    error,
    detail,
    clearError,
    refresh,
    changePage,
    setPageSize,
    updateFilters,
    updateSearch,
    openDetail,
    closeDetail,
    suspendUser,
    unsuspendUser,
    deleteUser,
    isEmpty,
  } = useUserManagement(initialState);

  const [searchDraft, setSearchDraft] = useState(filters.search ?? "");
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    user: null,
    action: null,
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

  const handleApplySearch = () => {
    updateSearch(searchDraft);
  };

  const handleViewDetail = async (userId: string) => {
    clearError();
    setHistoryError(null);
    setSelectedUserId(userId);

    const loaded = await openDetail(userId, false);
    if (!loaded) {
      setSelectedUserId(null);
      addToast({
        title: "Gagal memuat detail",
        description: "Data detail user tidak dapat diambil.",
        tone: "error",
      });
    }
  };

  const handleLoadHistory = async () => {
    if (!selectedUserId) {
      return;
    }

    setIsHistoryLoading(true);
    setHistoryError(null);

    try {
      const loaded = await openDetail(selectedUserId, true);
      if (!loaded) {
        throw new Error("Riwayat booking tidak tersedia");
      }
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Gagal memuat riwayat booking";
      setHistoryError(message);
      addToast({
        title: "Riwayat tidak dapat dimuat",
        description: message,
        tone: "error",
      });
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const openConfirm = (action: ActionType, user: AdminUserListItemDTO) => {
    setConfirmState({
      open: true,
      action,
      user,
    });
  };

  const closeConfirm = () => {
    setConfirmState({
      open: false,
      action: null,
      user: null,
    });
  };

  const performAction = async () => {
    const action = confirmState.action;
    const user = confirmState.user;

    if (!action || !user) {
      return;
    }

    try {
      if (action === "suspend") {
        await suspendUser(user.id);
        addToast({
          title: "User disuspend",
          description: `${user.name || user.email} berhasil disuspend.`,
          tone: "success",
        });
      }

      if (action === "unsuspend") {
        await unsuspendUser(user.id);
        addToast({
          title: "User diaktifkan",
          description: `${user.name || user.email} berhasil diunsuspend.`,
          tone: "success",
        });
      }

      if (action === "delete") {
        await deleteUser(user.id);
        addToast({
          title: "User dihapus",
          description: `${user.name || user.email} berhasil di-soft delete.`,
          tone: "success",
        });

        if (selectedUserId === user.id) {
          setSelectedUserId(null);
          closeDetail();
        }
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

  const actionCopy = useMemo(
    () => getActionCopy(confirmState.action, confirmState.user?.name || confirmState.user?.email || "user"),
    [confirmState.action, confirmState.user?.email, confirmState.user?.name]
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Manajemen User</h1>
        <p className="text-sm text-muted-foreground">
          Kelola akun user, suspend/unsuspend, soft delete, dan riwayat booking.
        </p>
      </header>

      {error ? (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <UsersFilterBar
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
          <CardTitle>Daftar User</CardTitle>
        </CardHeader>
        <CardContent>
          <UsersTable
            currentUserId={currentUserId}
            items={items}
            isLoading={isListLoading}
            isActionLoading={isActionLoading}
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={changePage}
            onPageSizeChange={setPageSize}
            onViewDetail={(userId) => void handleViewDetail(userId)}
            onSuspend={(user) => openConfirm("suspend", user)}
            onUnsuspend={(user) => openConfirm("unsuspend", user)}
            onDelete={(user) => openConfirm("delete", user)}
          />
        </CardContent>
      </Card>

      {isEmpty ? (
        <div className="rounded-md border border-border/60 bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          Tidak ada data user dengan filter saat ini.
        </div>
      ) : null}

      <UserDetailDialog
        open={Boolean(selectedUserId)}
        user={detail}
        isLoading={isDetailLoading}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUserId(null);
            closeDetail();
            setHistoryError(null);
          }
        }}
        onLoadHistory={() => void handleLoadHistory()}
        isHistoryLoading={isHistoryLoading}
        historyError={historyError}
      />

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
