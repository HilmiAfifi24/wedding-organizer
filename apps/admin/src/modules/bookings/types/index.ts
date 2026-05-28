import type {
  AdminBookingDetailDTO,
  AdminBookingListItemDTO,
  BookingStatus,
  BookingStatusHistoryDTO,
  PaginatedResult,
} from "@wo/shared-types";

export interface BookingListFilters {
  search?: string;
  status?: BookingStatus | "ALL";
  bookedFrom?: string;
  bookedTo?: string;
  vendor?: string;
  user?: string;
  sortBy?: "bookedAt" | "createdAt" | "updatedAt" | "status";
  sortDirection?: "asc" | "desc";
}

export type BookingListResult = PaginatedResult<AdminBookingListItemDTO>;
export type BookingDetailResult = AdminBookingDetailDTO;
export type BookingHistoryResult = BookingStatusHistoryDTO[];
