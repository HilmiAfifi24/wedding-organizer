import { PaymentProofStatus, VendorStatus } from "@wo/shared-types";

export interface PaymentMonitoringPermissionFlags {
  canView: boolean;
  canInsert: boolean;
  canUpdate: boolean;
  canUpsert: boolean;
  canDelete: boolean;
  canHistory: boolean;
}

export const PAYMENT_MONITORING_MENU_CODE = "PAYMENT_MONITORING";

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

export const mapPrismaPaymentProofStatusToDto = (status: string): PaymentProofStatus => {
  switch (status) {
    case "VERIFIED":
      return PaymentProofStatus.VERIFIED;
    case "REJECTED":
      return PaymentProofStatus.REJECTED;
    default:
      return PaymentProofStatus.PENDING;
  }
};
