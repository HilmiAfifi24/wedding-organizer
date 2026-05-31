"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";

import { useAuditLogDashboard } from "../hooks/use-audit-log-dashboard";
import type { AuditLogDashboardInitialState } from "../hooks/use-audit-log-dashboard";
import { AuditLogsFilterBar } from "./audit-logs-filter-bar";
import { AuditLogsTable } from "./audit-logs-table";

type AuditLogsDashboardProps = {
  initialState?: AuditLogDashboardInitialState;
};

export const AuditLogsDashboard = ({ initialState }: AuditLogsDashboardProps) => {
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
  } = useAuditLogDashboard(initialState);

  const [searchDraft, setSearchDraft] = useState(filters.search ?? "");
  const [actionDraft, setActionDraft] = useState(filters.action ?? "");
  const [actorDraft, setActorDraft] = useState(filters.actor ?? "");

  const applyFilters = () => {
    updateSearch(searchDraft);
    updateFilters({
      action: actionDraft.trim() || undefined,
      actor: actorDraft.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Audit Log Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Pusat monitoring aktivitas admin yang bersifat read-only, dengan snapshot data sebelum dan sesudah perubahan yang sudah disanitasi.
        </p>
      </header>

      {error ? (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <AuditLogsFilterBar
        filters={filters}
        searchDraft={searchDraft}
        actionDraft={actionDraft}
        actorDraft={actorDraft}
        onSearchDraftChange={setSearchDraft}
        onActionDraftChange={setActionDraft}
        onActorDraftChange={setActorDraft}
        onApplyFilters={applyFilters}
        onFiltersChange={updateFilters}
        onRefresh={() => void refresh()}
        isLoading={isListLoading}
      />

      <Card>
        <CardHeader>
          <CardTitle>Daftar Audit Log</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditLogsTable
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
          Tidak ada audit log yang cocok dengan filter saat ini.
        </div>
      ) : null}
    </div>
  );
};
