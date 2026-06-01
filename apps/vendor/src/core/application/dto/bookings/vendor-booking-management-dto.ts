import type {
  AdminBookingDetailDTO,
  AdminBookingListItemDTO,
  BookingStatus,
  BookingStatusHistoryDTO,
  PaginatedResult,
} from "@wo/shared-types";

export interface ParsedVendorBookingListQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: BookingStatus;
  bookedFrom?: Date;
  bookedTo?: Date;
  customer?: string;
  service?: string;
  sortBy?: "bookedAt" | "createdAt" | "updatedAt" | "status";
  sortDirection?: "asc" | "desc";
}

export type VendorBookingListResponse = PaginatedResult<AdminBookingListItemDTO>;
export type VendorBookingDetailResponse = AdminBookingDetailDTO;
export type VendorBookingHistoryResponse = BookingStatusHistoryDTO[];
