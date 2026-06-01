import { AuditModule } from "@wo/shared-types";

export interface AuditLogDashboardPermissionFlags {
  canView: boolean;
  canInsert: boolean;
  canUpdate: boolean;
  canUpsert: boolean;
  canDelete: boolean;
  canHistory: boolean;
}

export const AUDIT_LOG_DASHBOARD_MENU_CODE = "AUDIT_LOG_DASHBOARD";

const sensitiveKeyPattern =
  /password|passwordhash|token|secret|authorization|cookie|session|refresh|access|apikey|api_key/i;

export const sanitizeAuditValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeAuditValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, currentValue]) => [
        key,
        sensitiveKeyPattern.test(key) ? "[REDACTED]" : sanitizeAuditValue(currentValue),
      ])
    );
  }

  return value;
};

export const inferAuditTargetPath = (module: AuditModule, targetId: string): string | null => {
  switch (module) {
    case AuditModule.USER_MANAGEMENT:
      return `/users`;
    case AuditModule.VENDOR_MANAGEMENT:
      return `/vendors/${targetId}`;
    case AuditModule.VENDOR_PROFILE:
      return `/vendors/${targetId}`;
    case AuditModule.BOOKING_MANAGEMENT:
      return `/bookings/${targetId}`;
    case AuditModule.PAYMENT_MONITORING:
      return `/payments/${targetId}`;
    case AuditModule.REVIEW_MODERATION:
      return `/reviews/${targetId}`;
    default:
      return null;
  }
};
