import type {
  AdminBookingDetailDTO,
  AdminBookingListItemDTO,
  BookingStatus,
  BookingStatusHistoryDTO,
} from "@wo/shared-types";

export interface VendorBookingListQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: BookingStatus;
  bookedFrom?: Date;
  bookedTo?: Date;
  customer?: string;
  service?: string;
  sortBy: "bookedAt" | "createdAt" | "updatedAt" | "status";
  sortDirection: "asc" | "desc";
}

export interface VendorBookingManagementRepository {
  listBookings(vendorId: string, query: VendorBookingListQuery): Promise<{
    items: AdminBookingListItemDTO[];
    totalItems: number;
  }>;

  getBookingById(vendorId: string, bookingId: string): Promise<AdminBookingDetailDTO | null>;

  getBookingHistory(vendorId: string, bookingId: string): Promise<BookingStatusHistoryDTO[]>;

  transitionBookingStatus(input: {
    vendorId: string;
    bookingId: string;
    nextStatus: BookingStatus;
    actorId: string;
    note?: string;
  }): Promise<AdminBookingDetailDTO>;
}
