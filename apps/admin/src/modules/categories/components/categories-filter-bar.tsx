"use client";

import { Button, Input } from "@wo/ui-components";

import { CATEGORY_SORT_DIRECTION_OPTIONS, CATEGORY_SORT_OPTIONS } from "../constants";
import type { CategoryListFilters } from "../types";

interface CategoriesFilterBarProps {
  searchDraft: string;
  filters: CategoryListFilters;
  isLoading: boolean;
  onSearchDraftChange: (value: string) => void;
  onApplySearch: () => void;
  onFiltersChange: (patch: Partial<CategoryListFilters>) => void;
  onRefresh: () => void;
}

export const CategoriesFilterBar = ({
  searchDraft,
  filters,
  isLoading,
  onSearchDraftChange,
  onApplySearch,
  onFiltersChange,
  onRefresh,
}: CategoriesFilterBarProps) => {
  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_220px_220px_auto_auto]">
      <Input
        value={searchDraft}
        onChange={(event) => onSearchDraftChange(event.target.value)}
        placeholder="Cari nama kategori"
      />

      <select
        className="h-10 rounded-md border border-border bg-transparent px-3 text-sm"
        value={filters.sortBy ?? "name"}
        onChange={(event) =>
          onFiltersChange({
            sortBy: event.target.value as CategoryListFilters["sortBy"],
          })
        }
      >
        {CATEGORY_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        className="h-10 rounded-md border border-border bg-transparent px-3 text-sm"
        value={filters.sortDirection ?? "asc"}
        onChange={(event) =>
          onFiltersChange({
            sortDirection: event.target.value as CategoryListFilters["sortDirection"],
          })
        }
      >
        {CATEGORY_SORT_DIRECTION_OPTIONS.map((option) => (
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
