"use client";

import { useMemo, useState } from "react";

import type { AdminAdatListItemDTO } from "@wo/shared-types";
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

import { useAdatManagement } from "../hooks/use-adat-management";
import type { AdatManagementInitialState } from "../hooks/use-adat-management";
import { AdatsFilterBar } from "./adats-filter-bar";
import { AdatsTable } from "./adats-table";

type AdatFormState = {
  mode: "create" | "edit";
  adatId?: string;
  name: string;
};

type DeleteState = {
  open: boolean;
  adat: AdminAdatListItemDTO | null;
};

type AppToast = {
  id: string;
  title: string;
  description: string;
  tone: "success" | "error";
};

interface AdatsManagementDashboardProps {
  initialState?: AdatManagementInitialState;
}

export const AdatsManagementDashboard = ({
  initialState,
}: AdatsManagementDashboardProps) => {
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
    createAdat,
    updateAdat,
    deleteAdat,
    isEmpty,
  } = useAdatManagement(initialState);

  const [searchDraft, setSearchDraft] = useState(filters.search ?? "");
  const [formState, setFormState] = useState<AdatFormState>({
    mode: "create",
    name: "",
  });
  const [deleteState, setDeleteState] = useState<DeleteState>({
    open: false,
    adat: null,
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

  const resetForm = () => {
    setFormState({
      mode: "create",
      name: "",
    });
  };

  const handleSubmit = async () => {
    console.log("handleSubmit called. mode:", formState.mode, "adatId:", formState.adatId, "name:", formState.name);
    const normalizedName = formState.name.trim();

    if (!normalizedName) {
      console.log("Validation failed: name is empty");
      addToast({
        title: "Validasi gagal",
        description: "Nama adat wajib diisi.",
        tone: "error",
      });
      return;
    }

    try {
      if (formState.mode === "create") {
        console.log("Creating adat:", normalizedName);
        await createAdat(normalizedName);
        console.log("Adat created successfully");
        addToast({
          title: "Adat ditambahkan",
          description: `Adat ${normalizedName} berhasil dibuat.`,
          tone: "success",
        });
      } else if (formState.adatId) {
        console.log("Updating adat:", formState.adatId, "to:", normalizedName);
        await updateAdat(formState.adatId, normalizedName);
        console.log("Adat updated successfully");
        addToast({
          title: "Adat diperbarui",
          description: `Adat ${normalizedName} berhasil diperbarui.`,
          tone: "success",
        });
      } else {
        console.warn("Edit mode active but adatId is missing");
      }

      resetForm();
    } catch (actionError) {
      console.error("Error during handleSubmit:", actionError);
      addToast({
        title: "Aksi gagal",
        description:
          actionError instanceof Error ? actionError.message : "Perubahan adat gagal diproses.",
        tone: "error",
      });
    }
  };


  const handleEdit = (adat: AdminAdatListItemDTO) => {
    setFormState({
      mode: "edit",
      adatId: adat.id,
      name: adat.name,
    });
  };

  const handleDelete = (adat: AdminAdatListItemDTO) => {
    setDeleteState({
      open: true,
      adat,
    });
  };

  const closeDeleteDialog = () => {
    setDeleteState({
      open: false,
      adat: null,
    });
  };

  const performDelete = async () => {
    if (!deleteState.adat) {
      return;
    }

    try {
      await deleteAdat(deleteState.adat.id);
      addToast({
        title: "Adat dihapus",
        description: `Adat ${deleteState.adat.name} berhasil dihapus.`,
        tone: "success",
      });
      closeDeleteDialog();
    } catch (actionError) {
      addToast({
        title: "Hapus gagal",
        description:
          actionError instanceof Error ? actionError.message : "Adat gagal dihapus.",
        tone: "error",
      });
    }
  };

  const formTitle = useMemo(
    () => (formState.mode === "create" ? "Tambah Adat" : "Edit Adat"),
    [formState.mode]
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Manajemen Adat</h1>
        <p className="text-sm text-muted-foreground">
          Kelola adat/budaya tradisional yang dipakai oleh katalog layanan vendor.
        </p>
      </header>

      {error ? (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Filter Adat</CardTitle>
        </CardHeader>
        <CardContent>
          <AdatsFilterBar
            searchDraft={searchDraft}
            filters={filters}
            isLoading={isListLoading}
            onSearchDraftChange={setSearchDraft}
            onApplySearch={handleApplySearch}
            onFiltersChange={updateFilters}
            onRefresh={() => void refresh()}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{formTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
            <Input
              value={formState.name}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Masukkan nama adat"
            />
            <Button onClick={() => void handleSubmit()} disabled={isActionLoading}>
              {formState.mode === "create" ? "Tambah Adat" : "Simpan Perubahan"}
            </Button>
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={isActionLoading && formState.mode === "create"}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Adat</CardTitle>
        </CardHeader>
        <CardContent>
          <AdatsTable
            items={items}
            isLoading={isListLoading}
            isActionLoading={isActionLoading}
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={changePage}
            onPageSizeChange={setPageSize}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {isEmpty ? (
            <div className="mt-4 rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Belum ada adat vendor. Tambahkan adat pertama dari form di atas.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={deleteState.open} onOpenChange={(open) => (!open ? closeDeleteDialog() : undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Adat</DialogTitle>
            <DialogDescription>
              {deleteState.adat
                ? `Adat ${deleteState.adat.name} akan dihapus permanen.`
                : "Adat akan dihapus permanen."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteDialog}>
              Batal
            </Button>
            <Button
              variant="ghost"
              className="text-danger"
              onClick={() => void performDelete()}
              disabled={isActionLoading}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            className={
              toast.tone === "success"
                ? "pointer-events-auto border-success/30 bg-success/10"
                : "pointer-events-auto border-danger/30 bg-danger/10"
            }
          >
            <div className="grid gap-1">
              <ToastTitle>{toast.title}</ToastTitle>
              <ToastDescription>{toast.description}</ToastDescription>
            </div>
            <ToastClose onClick={() => dismissToast(toast.id)} />
          </Toast>
        ))}
      </div>
    </div>
  );
};
