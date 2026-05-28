import type {
  AdminVendorDetailDTO,
  AdminVendorListItemDTO,
  AdminVendorsQuery,
  PaginatedResult,
} from "@wo/shared-types";

export type VendorListResponse = PaginatedResult<AdminVendorListItemDTO>;

export type VendorDetailResponse = AdminVendorDetailDTO;

export interface ParsedVendorListQuery
  extends Required<Pick<AdminVendorsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">>,
    Omit<AdminVendorsQuery, "page" | "pageSize" | "sortBy" | "sortDirection"> {}
