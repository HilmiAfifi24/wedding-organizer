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

import { VENDOR_STATUS_FILTER_OPTIONS } from "../constants";
import type { VendorListFilters } from "../types";

type VendorsFilterBarProps = {
  filters: VendorListFilters;
  searchDraft: string;
  onSearchDraftChange: (value: string) => void;
  onApplySearch: () => void;
  onFiltersChange: (patch: Partial<VendorListFilters>) => void;
  onRefresh: () => void;
  isLoading: boolean;
};

export const VendorsFilterBar = ({
  filters,
  searchDraft,
  onSearchDraftChange,
  onApplySearch,
  onFiltersChange,
  onRefresh,
  isLoading,
}: VendorsFilterBarProps) => {
  return (
    <div className="grid gap-3 rounded-lg border border-border/60 bg-card p-4 lg:grid-cols-6">
      <div className="lg:col-span-2">
        <Input
          value={searchDraft}
          onChange={(event) => onSearchDraftChange(event.target.value)}
          placeholder="Cari nama vendor/owner/email/kategori"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onApplySearch();
            }
          }}
        />
      </div>

      <Select
        value={filters.status ?? "ALL"}
        onValueChange={(value) => onFiltersChange({ status: value as VendorListFilters["status"] })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter status" />
        </SelectTrigger>
        <SelectContent>
          {VENDOR_STATUS_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.sortBy ?? "createdAt"}
        onValueChange={(value) => onFiltersChange({ sortBy: value as VendorListFilters["sortBy"] })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Created At</SelectItem>
          <SelectItem value="updatedAt">Updated At</SelectItem>
          <SelectItem value="name">Vendor Name</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.sortDirection ?? "desc"}
        onValueChange={(value) =>
          onFiltersChange({ sortDirection: value as VendorListFilters["sortDirection"] })
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

      <div className="flex items-center gap-2 lg:col-span-6">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={filters.includeDeleted ?? false}
            onChange={(event) => onFiltersChange({ includeDeleted: event.target.checked })}
          />
          Tampilkan vendor terhapus
        </label>
        <Button variant="outline" onClick={onApplySearch} disabled={isLoading}>
          Cari
        </Button>
        <Button variant="ghost" onClick={onRefresh} disabled={isLoading}>
          Refresh
        </Button>
      </div>
    </div>
  );
};
