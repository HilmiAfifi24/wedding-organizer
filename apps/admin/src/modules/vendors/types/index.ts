import type {
  AdminVendorDetailDTO,
  AdminVendorListItemDTO,
  PaginatedResult,
  VendorStatus,
} from "@wo/shared-types";

export type VendorListResult = PaginatedResult<AdminVendorListItemDTO>;

export interface VendorListFilters {
  search?: string;
  status?: VendorStatus | "ALL";
  sortBy?: "createdAt" | "updatedAt" | "name";
  sortDirection?: "asc" | "desc";
  includeDeleted?: boolean;
}

export type VendorDetailResult = AdminVendorDetailDTO;
