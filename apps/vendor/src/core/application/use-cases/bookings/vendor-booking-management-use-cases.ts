import { BookingStatus, VendorStatus, type UpdateBookingStatusInput } from "@wo/shared-types";

import {
  canTransitionBookingStatus,
  isFinalBookingStatus,
} from "@/core/domain/entities/vendor-booking-management";
import type { VendorBookingManagementRepository } from "@/core/domain/repositories/vendor-booking-management-repository";

import type {
  ParsedVendorBookingListQuery,
  VendorBookingDetailResponse,
  VendorBookingHistoryResponse,
  VendorBookingListResponse,
} from "../../dto/bookings/vendor-booking-management-dto";

const defaultSortBy: NonNullable<ParsedVendorBookingListQuery["sortBy"]> = "bookedAt";
const defaultSortDirection: NonNullable<ParsedVendorBookingListQuery["sortDirection"]> = "desc";

const toPagedResult = (
  query: Pick<ParsedVendorBookingListQuery, "page" | "pageSize">,
  totalItems: number,
  items: VendorBookingListResponse["items"]
): VendorBookingListResponse => ({
  items,
  page: query.page,
  pageSize: query.pageSize,
  totalItems,
  totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
});

const assertVendorCanProcessBooking = (status: VendorStatus) => {
  if (status === VendorStatus.SUSPENDED) {
    throw new Error("Forbidden: suspended vendor cannot process booking");
  }
};

export class ListVendorBookingsUseCase {
  constructor(private readonly repository: VendorBookingManagementRepository) {}

  async execute(vendorId: string, query: ParsedVendorBookingListQuery): Promise<VendorBookingListResponse> {
    const normalizedQuery = {
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
      status: query.status,
      bookedFrom: query.bookedFrom,
      bookedTo: query.bookedTo,
      customer: query.customer,
      service: query.service,
      sortBy: query.sortBy ?? defaultSortBy,
      sortDirection: query.sortDirection ?? defaultSortDirection,
    };

    const result = await this.repository.listBookings(vendorId, normalizedQuery);
    return toPagedResult(normalizedQuery, result.totalItems, result.items);
  }
}

export class GetVendorBookingDetailUseCase {
  constructor(private readonly repository: VendorBookingManagementRepository) {}

  async execute(vendorId: string, bookingId: string): Promise<VendorBookingDetailResponse> {
    const booking = await this.repository.getBookingById(vendorId, bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    return booking;
  }
}

export class GetVendorBookingHistoryUseCase {
  constructor(private readonly repository: VendorBookingManagementRepository) {}

  async execute(vendorId: string, bookingId: string): Promise<VendorBookingHistoryResponse> {
    const booking = await this.repository.getBookingById(vendorId, bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    return this.repository.getBookingHistory(vendorId, bookingId);
  }
}

export class UpdateVendorBookingStatusUseCase {
  constructor(private readonly repository: VendorBookingManagementRepository) {}

  async execute(
    input: {
      actorId: string;
      vendorId: string;
      vendorStatus: VendorStatus;
      bookingId: string;
    },
    payload: UpdateBookingStatusInput
  ) {
    assertVendorCanProcessBooking(input.vendorStatus);

    const before = await this.repository.getBookingById(input.vendorId, input.bookingId);

    if (!before) {
      throw new Error("Booking not found");
    }

    if (before.status === payload.status) {
      throw new Error("Booking already in selected status");
    }

    if (isFinalBookingStatus(before.status)) {
      throw new Error(`Booking with status ${before.status} cannot be changed again`);
    }

    if (!canTransitionBookingStatus(before.status, payload.status)) {
      throw new Error(
        `Invalid booking status transition from ${before.status} to ${payload.status}`
      );
    }

    if (before.status === BookingStatus.PENDING && payload.status === BookingStatus.PENDING_PAYMENT) {
      return this.repository.transitionBookingStatus({
        vendorId: input.vendorId,
        bookingId: input.bookingId,
        nextStatus: payload.status,
        actorId: input.actorId,
        note: payload.note,
      });
    }

    if (before.status === BookingStatus.PENDING && payload.status === BookingStatus.REJECTED) {
      return this.repository.transitionBookingStatus({
        vendorId: input.vendorId,
        bookingId: input.bookingId,
        nextStatus: payload.status,
        actorId: input.actorId,
        note: payload.note,
      });
    }

    if (before.status === BookingStatus.PENDING_PAYMENT && payload.status === BookingStatus.CANCELLED) {
      return this.repository.transitionBookingStatus({
        vendorId: input.vendorId,
        bookingId: input.bookingId,
        nextStatus: payload.status,
        actorId: input.actorId,
        note: payload.note,
      });
    }

    if (
      before.status === BookingStatus.CONFIRMED &&
      (payload.status === BookingStatus.COMPLETED || payload.status === BookingStatus.CANCELLED)
    ) {
      return this.repository.transitionBookingStatus({
        vendorId: input.vendorId,
        bookingId: input.bookingId,
        nextStatus: payload.status,
        actorId: input.actorId,
        note: payload.note,
      });
    }

    throw new Error(`Transition from ${before.status} to ${payload.status} is not allowed`);
  }
}
