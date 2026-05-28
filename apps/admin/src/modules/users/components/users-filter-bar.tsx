"use client";

import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@wo/ui-components";

import { ROLE_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from "../constants";
import type { UserListFilters } from "../types";

type UsersFilterBarProps = {
  filters: UserListFilters;
  searchDraft: string;
  onSearchDraftChange: (value: string) => void;
  onApplySearch: () => void;
  onFiltersChange: (patch: Partial<UserListFilters>) => void;
  onRefresh: () => void;
  isLoading: boolean;
};

export const UsersFilterBar = ({
  filters,
  searchDraft,
  onSearchDraftChange,
  onApplySearch,
  onFiltersChange,
  onRefresh,
  isLoading,
}: UsersFilterBarProps) => {
  return (
    <div className="grid gap-3 rounded-lg border border-border/60 bg-card p-4 lg:grid-cols-6">
      <div className="lg:col-span-2">
        <Input
          value={searchDraft}
          onChange={(event) => onSearchDraftChange(event.target.value)}
          placeholder="Cari nama atau email"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onApplySearch();
            }
          }}
        />
      </div>

      <Select
        value={filters.role ?? "ALL"}
        onValueChange={(value) => onFiltersChange({ role: value as UserListFilters["role"] })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter role" />
        </SelectTrigger>
        <SelectContent>
          {ROLE_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status ?? "ALL"}
        onValueChange={(value) => onFiltersChange({ status: value as UserListFilters["status"] })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.sortBy ?? "createdAt"}
        onValueChange={(value) => onFiltersChange({ sortBy: value as UserListFilters["sortBy"] })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Created At</SelectItem>
          <SelectItem value="updatedAt">Updated At</SelectItem>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="email">Email</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.sortDirection ?? "desc"}
        onValueChange={(value) =>
          onFiltersChange({ sortDirection: value as UserListFilters["sortDirection"] })
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
          Tampilkan user terhapus
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
