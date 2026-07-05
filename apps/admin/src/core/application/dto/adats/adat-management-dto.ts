import type { AdminAdatsQuery, AdminAdatListItemDTO, PaginatedResult } from "@wo/shared-types";

export type ParsedAdatListQuery = Required<
  Pick<AdminAdatsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">
> &
  Omit<AdminAdatsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">;

export type AdatListResponse = PaginatedResult<AdminAdatListItemDTO>;
