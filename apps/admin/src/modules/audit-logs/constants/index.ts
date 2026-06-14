import { AuditModule } from "@wo/shared-types";
import type { BadgeProps } from "@wo/ui-components";

export const AUDIT_LOG_MODULE_FILTER_OPTIONS = [
  { label: "Semua Modul", value: "ALL" },
  { label: "User Management", value: AuditModule.USER_MANAGEMENT },
  { label: "Vendor Management", value: AuditModule.VENDOR_MANAGEMENT },
  { label: "Vendor Profile", value: AuditModule.VENDOR_PROFILE },
  { label: "Vendor Payments", value: AuditModule.VENDOR_PAYMENTS },
  { label: "Booking Management", value: AuditModule.BOOKING_MANAGEMENT },
  { label: "User Bookings", value: AuditModule.USER_BOOKINGS },
  { label: "User Payments", value: AuditModule.USER_PAYMENTS },
  { label: "Payment Monitoring", value: AuditModule.PAYMENT_MONITORING },
  { label: "Review Moderation", value: AuditModule.REVIEW_MODERATION },
] as const;

const moduleLabels: Record<AuditModule, string> = {
  [AuditModule.USER_MANAGEMENT]: "User Management",
  [AuditModule.VENDOR_MANAGEMENT]: "Vendor Management",
  [AuditModule.VENDOR_PROFILE]: "Vendor Profile",
  [AuditModule.VENDOR_PAYMENTS]: "Vendor Payments",
  [AuditModule.BOOKING_MANAGEMENT]: "Booking Management",
  [AuditModule.USER_BOOKINGS]: "User Bookings",
  [AuditModule.USER_PAYMENTS]: "User Payments",
  [AuditModule.PAYMENT_MONITORING]: "Payment Monitoring",
  [AuditModule.REVIEW_MODERATION]: "Review Moderation",
};

export const formatAuditModuleLabel = (module: AuditModule) => moduleLabels[module] ?? module;

export const getAuditModuleBadgeVariant = (module: AuditModule): NonNullable<BadgeProps["variant"]> => {
  switch (module) {
    case AuditModule.USER_MANAGEMENT:
      return "default";
    case AuditModule.VENDOR_MANAGEMENT:
      return "warning";
    case AuditModule.VENDOR_PROFILE:
      return "warning";
    case AuditModule.VENDOR_PAYMENTS:
      return "warning";
    case AuditModule.BOOKING_MANAGEMENT:
      return "success";
    case AuditModule.USER_BOOKINGS:
      return "success";
    case AuditModule.USER_PAYMENTS:
      return "success";
    case AuditModule.PAYMENT_MONITORING:
      return "warning";
    case AuditModule.REVIEW_MODERATION:
      return "danger";
    default:
      return "outline";
  }
};

export const getAuditActionBadgeVariant = (action: string): NonNullable<BadgeProps["variant"]> => {
  const normalizedAction = action.toLowerCase();

  if (normalizedAction.includes("delete") || normalizedAction.includes("reject")) {
    return "danger";
  }

  if (normalizedAction.includes("suspend") || normalizedAction.includes("hide")) {
    return "warning";
  }

  if (
    normalizedAction.includes("approve") ||
    normalizedAction.includes("verify") ||
    normalizedAction.includes("confirm") ||
    normalizedAction.includes("complete")
  ) {
    return "success";
  }

  return "outline";
};
