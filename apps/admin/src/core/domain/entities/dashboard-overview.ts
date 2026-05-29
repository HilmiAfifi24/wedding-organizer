import { BookingStatus, DashboardTimeRange, PaymentProofStatus, ReviewStatus, VendorStatus } from "@wo/shared-types";

export interface DashboardPermissionFlags {
  canView: boolean;
  canInsert: boolean;
  canUpdate: boolean;
  canUpsert: boolean;
  canDelete: boolean;
  canHistory: boolean;
}

export interface DashboardPermissionMap {
  dashboard: DashboardPermissionFlags | null;
  users: DashboardPermissionFlags | null;
  vendors: DashboardPermissionFlags | null;
  bookings: DashboardPermissionFlags | null;
  payments: DashboardPermissionFlags | null;
  reviews: DashboardPermissionFlags | null;
  auditLogs: DashboardPermissionFlags | null;
}

export interface DashboardDateRange {
  from: Date;
  to: Date;
}

export const DASHBOARD_MENU_CODE = "DASHBOARD";
export const USER_MANAGEMENT_MENU_CODE = "USER_MANAGEMENT";
export const VENDOR_MANAGEMENT_MENU_CODE = "VENDOR_MANAGEMENT";
export const BOOKING_MANAGEMENT_MENU_CODE = "BOOKING_MANAGEMENT";
export const PAYMENT_MONITORING_MENU_CODE = "PAYMENT_MONITORING";
export const REVIEW_MODERATION_MENU_CODE = "REVIEW_MODERATION";
export const AUDIT_LOG_DASHBOARD_MENU_CODE = "AUDIT_LOG_DASHBOARD";

export const DASHBOARD_MENU_CODES = {
  dashboard: DASHBOARD_MENU_CODE,
  users: USER_MANAGEMENT_MENU_CODE,
  vendors: VENDOR_MANAGEMENT_MENU_CODE,
  bookings: BOOKING_MANAGEMENT_MENU_CODE,
  payments: PAYMENT_MONITORING_MENU_CODE,
  reviews: REVIEW_MODERATION_MENU_CODE,
  auditLogs: AUDIT_LOG_DASHBOARD_MENU_CODE,
} as const;

export const resolveDashboardDateRange = (timeRange: DashboardTimeRange): DashboardDateRange => {
  const now = new Date();
  const to = new Date(now);
  const from = new Date(now);

  if (timeRange === DashboardTimeRange.TODAY) {
    from.setHours(0, 0, 0, 0);
    return { from, to };
  }

  const days =
    timeRange === DashboardTimeRange.LAST_7_DAYS
      ? 7
      : timeRange === DashboardTimeRange.LAST_90_DAYS
        ? 90
        : 30;

  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);

  return { from, to };
};

export const BOOKING_STATUS_ORDER: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.PENDING_PAYMENT,
  BookingStatus.CONFIRMED,
  BookingStatus.COMPLETED,
  BookingStatus.CANCELLED,
  BookingStatus.REJECTED,
];

export const VENDOR_STATUS_ORDER: VendorStatus[] = [
  VendorStatus.PENDING_VERIFICATION,
  VendorStatus.APPROVED,
  VendorStatus.REJECTED,
  VendorStatus.SUSPENDED,
];

export const PAYMENT_STATUS_ORDER: PaymentProofStatus[] = [
  PaymentProofStatus.PENDING,
  PaymentProofStatus.VERIFIED,
  PaymentProofStatus.REJECTED,
];

export const REVIEW_STATUS_ORDER: ReviewStatus[] = [
  ReviewStatus.VISIBLE,
  ReviewStatus.HIDDEN,
  ReviewStatus.DELETED,
];

export const hasViewPermission = (permission: DashboardPermissionFlags | null) =>
  Boolean(permission?.canView);

export const hasAuditHistoryPermission = (permission: DashboardPermissionFlags | null) =>
  Boolean(permission?.canView && permission?.canHistory);
