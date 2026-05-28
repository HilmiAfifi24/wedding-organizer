import { BookingStatus, VendorStatus } from "@wo/shared-types";

export interface BookingPermissionFlags {
  canView: boolean;
  canInsert: boolean;
  canUpdate: boolean;
  canUpsert: boolean;
  canDelete: boolean;
  canHistory: boolean;
}

export const BOOKING_MANAGEMENT_MENU_CODE = "BOOKING_MANAGEMENT";

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

const vendorProcessingStatuses = new Set<BookingStatus>([
  BookingStatus.PENDING_PAYMENT,
  BookingStatus.CONFIRMED,
  BookingStatus.COMPLETED,
]);

export const isFinalBookingStatus = (status: BookingStatus) => finalStatuses.has(status);

export const canTransitionBookingStatus = (
  currentStatus: BookingStatus,
  nextStatus: BookingStatus
) => allowedTransitions[currentStatus].includes(nextStatus);

export const canSuspendedVendorProcessStatus = (nextStatus: BookingStatus) =>
  !vendorProcessingStatuses.has(nextStatus);

export const mapPrismaVendorStatusToDto = (status: string): VendorStatus => {
  switch (status) {
    case "APPROVED":
      return VendorStatus.APPROVED;
    case "REJECTED":
      return VendorStatus.REJECTED;
    case "SUSPENDED":
      return VendorStatus.SUSPENDED;
    default:
      return VendorStatus.PENDING_VERIFICATION;
  }
};
