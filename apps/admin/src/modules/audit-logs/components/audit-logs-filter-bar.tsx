"use client";

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@wo/ui-components";

import { AUDIT_LOG_MODULE_FILTER_OPTIONS } from "../constants";
import type { AuditLogListFilters } from "../types";

type AuditLogsFilterBarProps = {
  filters: AuditLogListFilters;
  searchDraft: string;
  actionDraft: string;
  actorDraft: string;
  onSearchDraftChange: (value: string) => void;
  onActionDraftChange: (value: string) => void;
  onActorDraftChange: (value: string) => void;
  onApplyFilters: () => void;
  onFiltersChange: (patch: Partial<AuditLogListFilters>) => void;
  onRefresh: () => void;
  isLoading: boolean;
};

export const AuditLogsFilterBar = ({
  filters,
  searchDraft,
  actionDraft,
  actorDraft,
  onSearchDraftChange,
  onActionDraftChange,
  onActorDraftChange,
  onApplyFilters,
  onFiltersChange,
  onRefresh,
  isLoading,
}: AuditLogsFilterBarProps) => {
  return (
    <div className="grid gap-3 rounded-lg border border-border/60 bg-card p-4 xl:grid-cols-12">
      <div className="xl:col-span-3">
        <Input
          value={searchDraft}
          onChange={(event) => onSearchDraftChange(event.target.value)}
          placeholder="Cari actor, modul, aksi, target ID"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onApplyFilters();
            }
          }}
        />
      </div>

      <div className="xl:col-span-2">
        <Select
          value={filters.module ?? "ALL"}
          onValueChange={(value) => onFiltersChange({ module: value as AuditLogListFilters["module"] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Modul" />
          </SelectTrigger>
          <SelectContent>
            {AUDIT_LOG_MODULE_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="xl:col-span-2">
        <Input
          value={actionDraft}
          onChange={(event) => onActionDraftChange(event.target.value)}
          placeholder="Filter action"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onApplyFilters();
            }
          }}
        />
      </div>

      <div className="xl:col-span-2">
        <Input
          value={actorDraft}
          onChange={(event) => onActorDraftChange(event.target.value)}
          placeholder="Filter actor"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onApplyFilters();
            }
          }}
        />
      </div>

      <div>
        <Input
          type="date"
          value={filters.dateFrom ?? ""}
          onChange={(event) => onFiltersChange({ dateFrom: event.target.value || undefined })}
        />
      </div>

      <div>
        <Input
          type="date"
          value={filters.dateTo ?? ""}
          onChange={(event) => onFiltersChange({ dateTo: event.target.value || undefined })}
        />
      </div>

      <div>
        <Select
          value={filters.sortDirection ?? "desc"}
          onValueChange={(value) =>
            onFiltersChange({ sortDirection: value as AuditLogListFilters["sortDirection"] })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Urutan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Terbaru</SelectItem>
            <SelectItem value="asc">Terlama</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 xl:col-span-12">
        <Button variant="outline" onClick={onApplyFilters} disabled={isLoading}>
          Terapkan Filter
        </Button>
        <Button variant="ghost" onClick={onRefresh} disabled={isLoading}>
          Refresh
        </Button>
      </div>
    </div>
  );
};
