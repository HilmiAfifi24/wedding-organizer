"use client";

import { Button, Input } from "@wo/ui-components";

import { ADAT_SORT_DIRECTION_OPTIONS, ADAT_SORT_OPTIONS } from "../constants";
import type { AdatListFilters } from "../types";

interface AdatsFilterBarProps {
  searchDraft: string;
  filters: AdatListFilters;
  isLoading: boolean;
  onSearchDraftChange: (value: string) => void;
  onApplySearch: () => void;
  onFiltersChange: (patch: Partial<AdatListFilters>) => void;
  onRefresh: () => void;
}

export const AdatsFilterBar = ({
  searchDraft,
  filters,
  isLoading,
  onSearchDraftChange,
  onApplySearch,
  onFiltersChange,
  onRefresh,
}: AdatsFilterBarProps) => {
  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_220px_220px_auto_auto]">
      <Input
        value={searchDraft}
        onChange={(event) => onSearchDraftChange(event.target.value)}
        placeholder="Cari nama adat"
      />

      <select
        className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-2 focus:ring-offset-background"
        value={filters.sortBy ?? "name"}
        onChange={(event) =>
          onFiltersChange({
            sortBy: event.target.value as AdatListFilters["sortBy"],
          })
        }
      >
        {ADAT_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-2 focus:ring-offset-background"
        value={filters.sortDirection ?? "asc"}
        onChange={(event) =>
          onFiltersChange({
            sortDirection: event.target.value as AdatListFilters["sortDirection"],
          })
        }
      >
        {ADAT_SORT_DIRECTION_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <Button onClick={onApplySearch} disabled={isLoading}>
        Terapkan Filter
      </Button>

      <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
        Refresh
      </Button>
    </div>
  );
};
