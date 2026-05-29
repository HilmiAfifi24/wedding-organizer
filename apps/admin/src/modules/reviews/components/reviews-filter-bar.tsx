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

import {
  REVIEW_RATING_FILTER_OPTIONS,
  REVIEW_SORT_OPTIONS,
  REVIEW_STATUS_FILTER_OPTIONS,
} from "../constants";
import type { ReviewListFilters } from "../types";

type ReviewsFilterBarProps = {
  filters: ReviewListFilters;
  searchDraft: string;
  vendorDraft: string;
  onSearchDraftChange: (value: string) => void;
  onVendorDraftChange: (value: string) => void;
  onApplyFilters: () => void;
  onFiltersChange: (patch: Partial<ReviewListFilters>) => void;
  onRefresh: () => void;
  isLoading: boolean;
};

export const ReviewsFilterBar = ({
  filters,
  searchDraft,
  vendorDraft,
  onSearchDraftChange,
  onVendorDraftChange,
  onApplyFilters,
  onFiltersChange,
  onRefresh,
  isLoading,
}: ReviewsFilterBarProps) => {
  return (
    <div className="grid gap-3 rounded-lg border border-border/60 bg-card p-4 xl:grid-cols-12">
      <div className="xl:col-span-3">
        <Input
          value={searchDraft}
          onChange={(event) => onSearchDraftChange(event.target.value)}
          placeholder="Cari reviewer, vendor, isi review"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onApplyFilters();
            }
          }}
        />
      </div>

      <div className="xl:col-span-2">
        <Input
          value={vendorDraft}
          onChange={(event) => onVendorDraftChange(event.target.value)}
          placeholder="Filter vendor"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onApplyFilters();
            }
          }}
        />
      </div>

      <Select
        value={filters.status ?? "ALL"}
        onValueChange={(value) => onFiltersChange({ status: value as ReviewListFilters["status"] })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {REVIEW_STATUS_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={typeof filters.rating === "number" ? String(filters.rating) : "ALL"}
        onValueChange={(value) =>
          onFiltersChange({
            rating: value === "ALL" ? "ALL" : Number(value),
          })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Rating" />
        </SelectTrigger>
        <SelectContent>
          {REVIEW_RATING_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div>
        <Input
          type="date"
          value={filters.createdFrom ?? ""}
          onChange={(event) => onFiltersChange({ createdFrom: event.target.value || undefined })}
        />
      </div>

      <div>
        <Input
          type="date"
          value={filters.createdTo ?? ""}
          onChange={(event) => onFiltersChange({ createdTo: event.target.value || undefined })}
        />
      </div>

      <Select
        value={filters.sortBy ?? "createdAt"}
        onValueChange={(value) => onFiltersChange({ sortBy: value as ReviewListFilters["sortBy"] })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {REVIEW_SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.sortDirection ?? "desc"}
        onValueChange={(value) =>
          onFiltersChange({ sortDirection: value as ReviewListFilters["sortDirection"] })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Direction" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">Ascending</SelectItem>
          <SelectItem value="desc">Descending</SelectItem>
        </SelectContent>
      </Select>

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
