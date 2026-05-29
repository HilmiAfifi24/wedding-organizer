import { BookingStatus, DashboardTimeRange, PaymentProofStatus, ReviewStatus, VendorStatus } from "@wo/shared-types";

export const DASHBOARD_TIME_RANGE_OPTIONS = [
  { label: "Today", value: DashboardTimeRange.TODAY },
  { label: "Last 7 Days", value: DashboardTimeRange.LAST_7_DAYS },
  { label: "Last 30 Days", value: DashboardTimeRange.LAST_30_DAYS },
  { label: "Last 90 Days", value: DashboardTimeRange.LAST_90_DAYS },
] as const;

export const DASHBOARD_CHART_COLORS = [
  "#6366f1",
  "#06b6d4",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
];

export const KPI_ICON_BY_KEY: Record<string, "users" | "vendors" | "bookings" | "payments" | "reviews" | "alert"> = {
  "total-users": "users",
  "total-vendors": "vendors",
  "pending-vendors": "alert",
  "active-vendors": "vendors",
  "suspended-vendors": "alert",
  "total-bookings": "bookings",
  "pending-payments": "payments",
  "completed-bookings": "bookings",
  "cancelled-bookings": "alert",
  "total-reviews": "reviews",
};

export const formatDashboardMetricLabel = (value: string) =>
  value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const getStatusTone = (status: string) => {
  switch (status) {
    case BookingStatus.COMPLETED:
    case PaymentProofStatus.VERIFIED:
    case ReviewStatus.VISIBLE:
    case VendorStatus.APPROVED:
      return "success" as const;
    case BookingStatus.PENDING:
    case BookingStatus.PENDING_PAYMENT:
    case PaymentProofStatus.PENDING:
    case ReviewStatus.HIDDEN:
    case VendorStatus.PENDING_VERIFICATION:
      return "warning" as const;
    case BookingStatus.CANCELLED:
    case BookingStatus.REJECTED:
    case PaymentProofStatus.REJECTED:
    case ReviewStatus.DELETED:
    case VendorStatus.REJECTED:
    case VendorStatus.SUSPENDED:
      return "danger" as const;
    default:
      return "outline" as const;
  }
};

export const formatCompactNumber = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);

export const formatDateTime = (value: Date | string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const formatAverageRating = (value: number) => `${value.toFixed(1)} / 5`;
