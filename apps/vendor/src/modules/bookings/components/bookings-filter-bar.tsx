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

import { BOOKING_SORT_OPTIONS, BOOKING_STATUS_FILTER_OPTIONS } from "../constants";
import type { BookingListFilters } from "../types";

type BookingsFilterBarProps = {
  filters: BookingListFilters;
  searchDraft: string;
  customerDraft: string;
  serviceDraft: string;
  onSearchDraftChange: (value: string) => void;
  onCustomerDraftChange: (value: string) => void;
  onServiceDraftChange: (value: string) => void;
  onApplyFilters: () => void;
  onFiltersChange: (patch: Partial<BookingListFilters>) => void;
  onRefresh: () => void;
  isLoading: boolean;
};

export const BookingsFilterBar = ({
  filters,
  searchDraft,
  customerDraft,
  serviceDraft,
  onSearchDraftChange,
  onCustomerDraftChange,
  onServiceDraftChange,
  onApplyFilters,
  onFiltersChange,
  onRefresh,
  isLoading,
}: BookingsFilterBarProps) => {
  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/65 p-4 xl:grid-cols-12">
      <div className="xl:col-span-3">
        <Input
          value={searchDraft}
          onChange={(event) => onSearchDraftChange(event.target.value)}
          placeholder="Cari kode booking, catatan, customer, service"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onApplyFilters();
            }
          }}
        />
      </div>

      <div className="xl:col-span-2">
        <Input
          value={customerDraft}
          onChange={(event) => onCustomerDraftChange(event.target.value)}
          placeholder="Filter customer"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onApplyFilters();
            }
          }}
        />
      </div>

      <div className="xl:col-span-2">
        <Input
          value={serviceDraft}
          onChange={(event) => onServiceDraftChange(event.target.value)}
          placeholder="Filter service"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onApplyFilters();
            }
          }}
        />
      </div>

      <Select
        value={filters.status ?? "ALL"}
        onValueChange={(value) => onFiltersChange({ status: value as BookingListFilters["status"] })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {BOOKING_STATUS_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div>
        <Input
          type="date"
          value={filters.bookedFrom ?? ""}
          onChange={(event) => onFiltersChange({ bookedFrom: event.target.value || undefined })}
        />
      </div>

      <div>
        <Input
          type="date"
          value={filters.bookedTo ?? ""}
          onChange={(event) => onFiltersChange({ bookedTo: event.target.value || undefined })}
        />
      </div>

      <Select
        value={filters.sortBy ?? "bookedAt"}
        onValueChange={(value) => onFiltersChange({ sortBy: value as BookingListFilters["sortBy"] })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {BOOKING_SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.sortDirection ?? "desc"}
        onValueChange={(value) =>
          onFiltersChange({ sortDirection: value as BookingListFilters["sortDirection"] })
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
