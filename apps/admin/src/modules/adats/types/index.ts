import type { AdminAdatListItemDTO, PaginatedResult } from "@wo/shared-types";

export type AdatListResult = PaginatedResult<AdminAdatListItemDTO>;

export interface AdatListFilters {
  search?: string;
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortDirection?: "asc" | "desc";
}
