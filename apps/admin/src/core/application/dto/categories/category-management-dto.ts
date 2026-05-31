import type { AdminCategoriesQuery, AdminCategoryListItemDTO, PaginatedResult } from "@wo/shared-types";

export type ParsedCategoryListQuery = Required<
  Pick<AdminCategoriesQuery, "page" | "pageSize" | "sortBy" | "sortDirection">
> &
  Omit<AdminCategoriesQuery, "page" | "pageSize" | "sortBy" | "sortDirection">;

export type CategoryListResponse = PaginatedResult<AdminCategoryListItemDTO>;
