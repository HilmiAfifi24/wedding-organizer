import type {
  AdminBookingDetailDTO,
  AdminBookingListItemDTO,
  AdminBookingsQuery,
  AuditLogDTO,
  BookingStatus,
  BookingStatusHistoryDTO,
  CreateAuditLogInput,
} from "@wo/shared-types";

import type { BookingPermissionFlags } from "@/core/domain/entities/booking-management";

export interface BookingManagementRepository {
  getActorPermissionByMenuCode(
    actorId: string,
    menuCode: string
  ): Promise<BookingPermissionFlags | null>;

  listBookings(
    query: Required<
      Pick<AdminBookingsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">
    > &
      Omit<AdminBookingsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">
  ): Promise<{ items: AdminBookingListItemDTO[]; totalItems: number }>;

  getBookingById(bookingId: string): Promise<AdminBookingDetailDTO | null>;
  getBookingHistory(bookingId: string): Promise<BookingStatusHistoryDTO[]>;

  transitionBookingStatus(input: {
    bookingId: string;
    nextStatus: BookingStatus;
    actorId: string;
    note?: string;
  }): Promise<AdminBookingDetailDTO>;

  createAuditLog(data: CreateAuditLogInput): Promise<AuditLogDTO>;
}
