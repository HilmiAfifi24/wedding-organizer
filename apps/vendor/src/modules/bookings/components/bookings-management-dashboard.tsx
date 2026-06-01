"use client";

import { useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
} from "@wo/ui-components";

import { useBookingManagement } from "../hooks/use-booking-management";
import type { BookingManagementInitialState } from "../hooks/use-booking-management";
import { BookingsFilterBar } from "./bookings-filter-bar";
import { BookingsTable } from "./bookings-table";

type AppToast = {
  id: string;
  title: string;
  description: string;
  tone: "success" | "error";
};

type BookingsManagementDashboardProps = {
  initialState?: BookingManagementInitialState;
};

export const BookingsManagementDashboard = ({ initialState }: BookingsManagementDashboardProps) => {
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
  } = useBookingManagement(initialState);

  const [searchDraft, setSearchDraft] = useState(filters.search ?? "");
  const [customerDraft, setCustomerDraft] = useState(filters.customer ?? "");
  const [serviceDraft, setServiceDraft] = useState(filters.service ?? "");
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
      customer: customerDraft.trim() || undefined,
      service: serviceDraft.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <BookingsFilterBar
        filters={filters}
        searchDraft={searchDraft}
        customerDraft={customerDraft}
        serviceDraft={serviceDraft}
        onSearchDraftChange={setSearchDraft}
        onCustomerDraftChange={setCustomerDraft}
        onServiceDraftChange={setServiceDraft}
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

      <Card className="border border-white/10 bg-slate-950/65 text-slate-100">
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
        <div className="rounded-xl border border-white/10 bg-slate-950/65 px-4 py-8 text-center text-sm text-slate-300">
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
