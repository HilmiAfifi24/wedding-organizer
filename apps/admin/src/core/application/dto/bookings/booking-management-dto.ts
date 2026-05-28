import type {
  AdminBookingDetailDTO,
  AdminBookingListItemDTO,
  AdminBookingsQuery,
  BookingStatusHistoryDTO,
  PaginatedResult,
} from "@wo/shared-types";

export type BookingListResponse = PaginatedResult<AdminBookingListItemDTO>;

export type BookingDetailResponse = AdminBookingDetailDTO;

export type BookingHistoryResponse = BookingStatusHistoryDTO[];

export interface ParsedBookingListQuery
  extends Required<Pick<AdminBookingsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">>,
    Omit<AdminBookingsQuery, "page" | "pageSize" | "sortBy" | "sortDirection"> {}
