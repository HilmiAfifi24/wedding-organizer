"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle, Toast, ToastClose, ToastDescription, ToastTitle } from "@wo/ui-components";

import { useBookingManagement } from "../hooks/use-booking-management";
import { BookingsFilterBar } from "./bookings-filter-bar";
import { BookingsTable } from "./bookings-table";

type AppToast = {
  id: string;
  title: string;
  description: string;
  tone: "success" | "error";
};

export const BookingsManagementDashboard = () => {
  const {
    items,
    page,
    pageSize,
    totalItems,
    totalPages,
    filters,
    isListLoading,
    error,
    refresh,
    changePage,
    setPageSize,
    updateFilters,
    updateSearch,
    isEmpty,
  } = useBookingManagement();

  const [searchDraft, setSearchDraft] = useState(filters.search ?? "");
  const [vendorDraft, setVendorDraft] = useState(filters.vendor ?? "");
  const [userDraft, setUserDraft] = useState(filters.user ?? "");
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
      user: userDraft.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Manajemen Booking</h1>
        <p className="text-sm text-muted-foreground">
          Pantau booking, validasi transisi status, dan telusuri timeline perubahan dari backend.
        </p>
      </header>

      {error ? (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <BookingsFilterBar
        filters={filters}
        searchDraft={searchDraft}
        vendorDraft={vendorDraft}
        userDraft={userDraft}
        onSearchDraftChange={setSearchDraft}
        onVendorDraftChange={setVendorDraft}
        onUserDraftChange={setUserDraft}
        onApplyFilters={applyFilters}
        onFiltersChange={updateFilters}
        onRefresh={() =>
          void refresh().catch((refreshError) =>
            addToast({
              title: "Refresh gagal",
              description:
                refreshError instanceof Error ? refreshError.message : "Gagal memuat ulang booking",
              tone: "error",
            })
          )
        }
        isLoading={isListLoading}
      />

      <Card>
        <CardHeader>
          <CardTitle>Daftar Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingsTable
            items={items}
            isLoading={isListLoading}
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={changePage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>

      {isEmpty ? (
        <div className="rounded-md border border-border/60 bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          Tidak ada booking dengan filter saat ini.
        </div>
      ) : null}

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
