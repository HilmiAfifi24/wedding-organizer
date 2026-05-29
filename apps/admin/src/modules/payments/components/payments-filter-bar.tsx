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
  BOOKING_STATUS_FILTER_OPTIONS,
  PAYMENT_PROOF_SORT_OPTIONS,
  PAYMENT_PROOF_STATUS_FILTER_OPTIONS,
} from "../constants";
import type { PaymentProofListFilters } from "../types";

type PaymentsFilterBarProps = {
  filters: PaymentProofListFilters;
  searchDraft: string;
  vendorDraft: string;
  onSearchDraftChange: (value: string) => void;
  onVendorDraftChange: (value: string) => void;
  onApplyFilters: () => void;
  onFiltersChange: (patch: Partial<PaymentProofListFilters>) => void;
  onRefresh: () => void;
  isLoading: boolean;
};

export const PaymentsFilterBar = ({
  filters,
  searchDraft,
  vendorDraft,
  onSearchDraftChange,
  onVendorDraftChange,
  onApplyFilters,
  onFiltersChange,
  onRefresh,
  isLoading,
}: PaymentsFilterBarProps) => {
  return (
    <div className="grid gap-3 rounded-lg border border-border/60 bg-card p-4 xl:grid-cols-12">
      <div className="xl:col-span-3">
        <Input
          value={searchDraft}
          onChange={(event) => onSearchDraftChange(event.target.value)}
          placeholder="Cari booking code, user, vendor"
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
        value={filters.paymentProofStatus ?? "ALL"}
        onValueChange={(value) =>
          onFiltersChange({
            paymentProofStatus: value as PaymentProofListFilters["paymentProofStatus"],
          })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Status proof" />
        </SelectTrigger>
        <SelectContent>
          {PAYMENT_PROOF_STATUS_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.bookingStatus ?? "ALL"}
        onValueChange={(value) =>
          onFiltersChange({
            bookingStatus: value as PaymentProofListFilters["bookingStatus"],
          })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Status booking" />
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
          value={filters.uploadedFrom ?? ""}
          onChange={(event) => onFiltersChange({ uploadedFrom: event.target.value || undefined })}
        />
      </div>

      <div>
        <Input
          type="date"
          value={filters.uploadedTo ?? ""}
          onChange={(event) => onFiltersChange({ uploadedTo: event.target.value || undefined })}
        />
      </div>

      <Select
        value={filters.sortBy ?? "createdAt"}
        onValueChange={(value) => onFiltersChange({ sortBy: value as PaymentProofListFilters["sortBy"] })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {PAYMENT_PROOF_SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.sortDirection ?? "desc"}
        onValueChange={(value) =>
          onFiltersChange({
            sortDirection: value as PaymentProofListFilters["sortDirection"],
          })
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
