import type { AdminCategoryListItemDTO, PaginatedResult } from "@wo/shared-types";

export type CategoryListResult = PaginatedResult<AdminCategoryListItemDTO>;

export interface CategoryListFilters {
  search?: string;
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortDirection?: "asc" | "desc";
}
