import { BookingStatus } from "@wo/shared-types";

const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.PENDING]: [BookingStatus.PENDING_PAYMENT, BookingStatus.REJECTED],
  [BookingStatus.PENDING_PAYMENT]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  [BookingStatus.REJECTED]: [],
  [BookingStatus.COMPLETED]: [],
  [BookingStatus.CANCELLED]: [],
};

const finalStatuses = new Set<BookingStatus>([
  BookingStatus.REJECTED,
  BookingStatus.COMPLETED,
  BookingStatus.CANCELLED,
]);

export const isFinalBookingStatus = (status: BookingStatus) => finalStatuses.has(status);

export const canTransitionBookingStatus = (
  currentStatus: BookingStatus,
  nextStatus: BookingStatus
) => allowedTransitions[currentStatus].includes(nextStatus);
