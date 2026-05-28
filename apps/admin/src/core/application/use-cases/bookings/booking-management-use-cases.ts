import {
  AuditModule,
  BookingStatus,
  VendorStatus,
  type CreateAuditLogInput,
  type UpdateBookingStatusInput,
} from "@wo/shared-types";

import {
  BOOKING_MANAGEMENT_MENU_CODE,
  canSuspendedVendorProcessStatus,
  canTransitionBookingStatus,
  isFinalBookingStatus,
  type BookingPermissionFlags,
} from "@/core/domain/entities/booking-management";
import type { BookingManagementRepository } from "@/core/domain/repositories";

import type {
  BookingDetailResponse,
  BookingHistoryResponse,
  BookingListResponse,
  ParsedBookingListQuery,
} from "../../dto/bookings/booking-management-dto";

const assertPermission = (
  permission: BookingPermissionFlags | null,
  key: keyof BookingPermissionFlags,
  message: string
) => {
  if (!permission || !permission[key]) {
    throw new Error(message);
  }
};

const defaultSortBy: NonNullable<ParsedBookingListQuery["sortBy"]> = "bookedAt";
const defaultSortDirection: NonNullable<ParsedBookingListQuery["sortDirection"]> = "desc";

const toPagedResult = (
  query: Pick<ParsedBookingListQuery, "page" | "pageSize">,
  totalItems: number,
  items: BookingListResponse["items"]
): BookingListResponse => ({
  items,
  page: query.page,
  pageSize: query.pageSize,
  totalItems,
  totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
});

const createAuditPayload = (
  actorId: string,
  action: string,
  targetId: string,
  beforeData: unknown,
  afterData: unknown
): CreateAuditLogInput => ({
  actorId,
  module: AuditModule.BOOKING_MANAGEMENT,
  action,
  targetId,
  beforeData,
  afterData,
});

const resolveBookingAction = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.CANCELLED:
      return "CANCEL_BOOKING";
    case BookingStatus.REJECTED:
      return "REJECT_BOOKING";
    case BookingStatus.COMPLETED:
      return "COMPLETE_BOOKING";
    default:
      return `UPDATE_STATUS_${status}`;
  }
};

export class ListAdminBookingsUseCase {
  constructor(private readonly repository: BookingManagementRepository) {}

  async execute(actorId: string, query: ParsedBookingListQuery): Promise<BookingListResponse> {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      BOOKING_MANAGEMENT_MENU_CODE
    );

    assertPermission(permission, "canView", "Forbidden: no permission to view bookings");

    const normalizedQuery: ParsedBookingListQuery = {
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
      status: query.status,
      bookedFrom: query.bookedFrom,
      bookedTo: query.bookedTo,
      vendor: query.vendor,
      user: query.user,
      sortBy: query.sortBy ?? defaultSortBy,
      sortDirection: query.sortDirection ?? defaultSortDirection,
    };

    const result = await this.repository.listBookings(normalizedQuery);
    return toPagedResult(normalizedQuery, result.totalItems, result.items);
  }
}

export class GetAdminBookingDetailUseCase {
  constructor(private readonly repository: BookingManagementRepository) {}

  async execute(actorId: string, bookingId: string): Promise<BookingDetailResponse> {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      BOOKING_MANAGEMENT_MENU_CODE
    );

    assertPermission(permission, "canView", "Forbidden: no permission to view booking detail");

    const booking = await this.repository.getBookingById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    return booking;
  }
}

export class GetAdminBookingHistoryUseCase {
  constructor(private readonly repository: BookingManagementRepository) {}

  async execute(actorId: string, bookingId: string): Promise<BookingHistoryResponse> {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      BOOKING_MANAGEMENT_MENU_CODE
    );

    assertPermission(permission, "canHistory", "Forbidden: no permission to view booking history");

    const booking = await this.repository.getBookingById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    return this.repository.getBookingHistory(bookingId);
  }
}

export class UpdateAdminBookingStatusUseCase {
  constructor(private readonly repository: BookingManagementRepository) {}

  async execute(actorId: string, bookingId: string, input: UpdateBookingStatusInput) {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      BOOKING_MANAGEMENT_MENU_CODE
    );

    assertPermission(permission, "canUpdate", "Forbidden: no permission to update booking");

    const before = await this.repository.getBookingById(bookingId);
    if (!before) {
      throw new Error("Booking not found");
    }

    if (before.status === input.status) {
      throw new Error("Booking already in selected status");
    }

    if (isFinalBookingStatus(before.status)) {
      throw new Error(`Booking with status ${before.status} cannot be changed again`);
    }

    if (!canTransitionBookingStatus(before.status, input.status)) {
      throw new Error(`Invalid booking status transition from ${before.status} to ${input.status}`);
    }

    if (before.user.deletedAt || before.vendor.deletedAt) {
      throw new Error("Booking must belong to valid user and vendor");
    }

    if (
      before.vendor.status === VendorStatus.SUSPENDED &&
      !canSuspendedVendorProcessStatus(input.status)
    ) {
      throw new Error("Suspended vendor cannot process booking");
    }

    const after = await this.repository.transitionBookingStatus({
      bookingId,
      nextStatus: input.status,
      actorId,
      note: input.note,
    });

    await this.repository.createAuditLog(
      createAuditPayload(actorId, resolveBookingAction(input.status), bookingId, before, {
        ...after,
        transitionNote: input.note,
      })
    );

    return after;
  }
}
