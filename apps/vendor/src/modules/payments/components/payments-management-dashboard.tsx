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

import { usePaymentManagement } from "../hooks/use-payment-management";
import type { PaymentManagementInitialState } from "../hooks/use-payment-management";
import { PaymentsFilterBar } from "./payments-filter-bar";
import { PaymentsTable } from "./payments-table";

type AppToast = {
  id: string;
  title: string;
  description: string;
  tone: "success" | "error";
};

type PaymentsManagementDashboardProps = {
  initialState?: PaymentManagementInitialState;
};

export const PaymentsManagementDashboard = ({
  initialState,
}: PaymentsManagementDashboardProps) => {
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
  } = usePaymentManagement(initialState);

  const [searchDraft, setSearchDraft] = useState(filters.search ?? "");
  const [customerDraft, setCustomerDraft] = useState(filters.customer ?? "");
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
    });
  };

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <PaymentsFilterBar
        filters={filters}
        searchDraft={searchDraft}
        customerDraft={customerDraft}
        onSearchDraftChange={setSearchDraft}
        onCustomerDraftChange={setCustomerDraft}
        onApplyFilters={applyFilters}
        onFiltersChange={updateFilters}
        onRefresh={() =>
          void refresh().catch((refreshError) =>
            addToast({
              title: "Refresh gagal",
              description:
                refreshError instanceof Error
                  ? refreshError.message
                  : "Gagal memuat ulang payment proof",
              tone: "error",
            })
          )
        }
        isLoading={isListLoading}
      />

      <Card className="border border-white/10 bg-slate-950/65 text-slate-100">
        <CardHeader>
          <CardTitle>Daftar Payment Proof</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentsTable
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
          Tidak ada payment proof dengan filter saat ini.
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
