import { VendorStatus } from "@wo/shared-types";

export interface VendorPermissionFlags {
  canView: boolean;
  canInsert: boolean;
  canUpdate: boolean;
  canUpsert: boolean;
  canDelete: boolean;
  canHistory: boolean;
}

export interface VendorVerificationChecklist {
  businessNameExists: boolean;
  categoryExists: boolean;
  phoneNumberValid: boolean;
  hasMinimumService: boolean;
  hasMinimumPortfolio: boolean;
  isComplete: boolean;
}

export const VENDOR_MANAGEMENT_MENU_CODE = "VENDOR_MANAGEMENT";

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

export const mapDtoVendorStatusToPrisma = (
  status: VendorStatus
): "PENDING_VERIFICATION" | "APPROVED" | "REJECTED" | "SUSPENDED" => {
  switch (status) {
    case VendorStatus.APPROVED:
      return "APPROVED";
    case VendorStatus.REJECTED:
      return "REJECTED";
    case VendorStatus.SUSPENDED:
      return "SUSPENDED";
    default:
      return "PENDING_VERIFICATION";
  }
};

const phoneRegex = /^\+?[1-9]\d{8,14}$/;

export const evaluateVendorVerificationChecklist = (input: {
  businessName?: string | null;
  categoryId?: string | null;
  phoneNumber?: string | null;
  serviceCount: number;
  portfolioCount: number;
}): VendorVerificationChecklist => {
  const businessNameExists = Boolean(input.businessName?.trim());
  const categoryExists = Boolean(input.categoryId);
  const phoneNumberValid = Boolean(input.phoneNumber && phoneRegex.test(input.phoneNumber));
  const hasMinimumService = input.serviceCount >= 1;
  const hasMinimumPortfolio = input.portfolioCount >= 1;
  const isComplete =
    businessNameExists &&
    categoryExists &&
    phoneNumberValid &&
    hasMinimumService &&
    hasMinimumPortfolio;

  return {
    businessNameExists,
    categoryExists,
    phoneNumberValid,
    hasMinimumService,
    hasMinimumPortfolio,
    isComplete,
  };
};
