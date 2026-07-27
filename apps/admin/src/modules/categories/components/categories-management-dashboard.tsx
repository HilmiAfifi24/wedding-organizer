"use client";

import { useMemo, useState } from "react";

import type { AdminCategoryListItemDTO } from "@wo/shared-types";
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

import { useCategoryManagement } from "../hooks/use-category-management";
import type { CategoryManagementInitialState } from "../hooks/use-category-management";
import { CategoriesFilterBar } from "./categories-filter-bar";
import { CategoriesTable } from "./categories-table";

type CategoryFormState = {
  mode: "create" | "edit";
  categoryId?: string;
  name: string;
};

type DeleteState = {
  open: boolean;
  category: AdminCategoryListItemDTO | null;
};

type AppToast = {
  id: string;
  title: string;
  description: string;
  tone: "success" | "error";
};

interface CategoriesManagementDashboardProps {
  initialState?: CategoryManagementInitialState;
}

export const CategoriesManagementDashboard = ({
  initialState,
}: CategoriesManagementDashboardProps) => {
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
    createCategory,
    updateCategory,
    deleteCategory,
    isEmpty,
  } = useCategoryManagement(initialState);

  const [searchDraft, setSearchDraft] = useState(filters.search ?? "");
  const [formState, setFormState] = useState<CategoryFormState>({
    mode: "create",
    name: "",
  });
  const [deleteState, setDeleteState] = useState<DeleteState>({
    open: false,
    category: null,
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
    console.log("handleSubmit called. mode:", formState.mode, "categoryId:", formState.categoryId, "name:", formState.name);
    const normalizedName = formState.name.trim();

    if (!normalizedName) {
      console.log("Validation failed: name is empty");
      addToast({
        title: "Validasi gagal",
        description: "Nama kategori wajib diisi.",
        tone: "error",
      });
      return;
    }

    try {
      if (formState.mode === "create") {
        console.log("Creating category:", normalizedName);
        await createCategory(normalizedName);
        console.log("Category created successfully");
        addToast({
          title: "Kategori ditambahkan",
          description: `Kategori ${normalizedName} berhasil dibuat.`,
          tone: "success",
        });
      } else if (formState.categoryId) {
        console.log("Updating category:", formState.categoryId, "to:", normalizedName);
        await updateCategory(formState.categoryId, normalizedName);
        console.log("Category updated successfully");
        addToast({
          title: "Kategori diperbarui",
          description: `Kategori ${normalizedName} berhasil diperbarui.`,
          tone: "success",
        });
      } else {
        console.warn("Edit mode active but categoryId is missing");
      }

      resetForm();
    } catch (actionError) {
      console.error("Error during handleSubmit:", actionError);
      addToast({
        title: "Aksi gagal",
        description:
          actionError instanceof Error ? actionError.message : "Perubahan kategori gagal diproses.",
        tone: "error",
      });
    }
  };


  const handleEdit = (category: AdminCategoryListItemDTO) => {
    setFormState({
      mode: "edit",
      categoryId: category.id,
      name: category.name,
    });
  };

  const handleDelete = (category: AdminCategoryListItemDTO) => {
    setDeleteState({
      open: true,
      category,
    });
  };

  const closeDeleteDialog = () => {
    setDeleteState({
      open: false,
      category: null,
    });
  };

  const performDelete = async () => {
    if (!deleteState.category) {
      return;
    }

    try {
      await deleteCategory(deleteState.category.id);
      addToast({
        title: "Kategori dihapus",
        description: `Kategori ${deleteState.category.name} berhasil dihapus.`,
        tone: "success",
      });
      closeDeleteDialog();
    } catch (actionError) {
      addToast({
        title: "Hapus gagal",
        description:
          actionError instanceof Error ? actionError.message : "Kategori gagal dihapus.",
        tone: "error",
      });
    }
  };

  const formTitle = useMemo(
    () => (formState.mode === "create" ? "Tambah Kategori" : "Edit Kategori"),
    [formState.mode]
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Manajemen Kategori</h1>
        <p className="text-sm text-muted-foreground">
          Kelola kategori vendor yang dipakai oleh registrasi dan onboarding vendor.
        </p>
      </header>

      {error ? (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Filter Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoriesFilterBar
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
              placeholder="Masukkan nama kategori"
            />
            <Button onClick={() => void handleSubmit()} disabled={isActionLoading}>
              {formState.mode === "create" ? "Tambah Kategori" : "Simpan Perubahan"}
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
          <CardTitle>Daftar Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoriesTable
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
              Belum ada kategori vendor. Tambahkan kategori pertama dari form di atas.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={deleteState.open} onOpenChange={(open) => (!open ? closeDeleteDialog() : undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Kategori</DialogTitle>
            <DialogDescription>
              {deleteState.category
                ? `Kategori ${deleteState.category.name} akan dihapus permanen.`
                : "Kategori akan dihapus permanen."}
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
