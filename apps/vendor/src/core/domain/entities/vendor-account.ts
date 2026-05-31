import {
  VendorOnboardingStatus,
  VendorStatus,
  type VendorVerificationChecklistDTO,
} from "@wo/shared-types";

export const VENDOR_PHONE_REGEX = /^(\+?62|0)\d{8,13}$/;

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

export const evaluateVendorVerificationChecklist = (input: {
  businessName?: string | null;
  categoryId?: string | null;
  phoneNumber?: string | null;
  businessAddress?: string | null;
  city?: string | null;
  province?: string | null;
  serviceCount: number;
  portfolioCount: number;
}): VendorVerificationChecklistDTO => {
  const businessNameExists = Boolean(input.businessName?.trim());
  const categoryExists = Boolean(input.categoryId);
  const phoneNumberValid = Boolean(input.phoneNumber && VENDOR_PHONE_REGEX.test(input.phoneNumber));
  const addressCompleted = Boolean(
    input.businessAddress?.trim() && input.city?.trim() && input.province?.trim()
  );
  const hasMinimumService = input.serviceCount >= 1;
  const hasMinimumPortfolio = input.portfolioCount >= 1;

  return {
    businessNameExists,
    categoryExists,
    phoneNumberValid,
    addressCompleted,
    hasMinimumService,
    hasMinimumPortfolio,
    isComplete:
      businessNameExists &&
      categoryExists &&
      phoneNumberValid &&
      addressCompleted &&
      hasMinimumService &&
      hasMinimumPortfolio,
  };
};

export const resolveVendorOnboardingStatus = (
  checklist: VendorVerificationChecklistDTO
): VendorOnboardingStatus =>
  checklist.isComplete
    ? VendorOnboardingStatus.READY_FOR_REVIEW
    : VendorOnboardingStatus.INCOMPLETE;

export const resolveVendorLandingPath = (status: VendorStatus) => {
  switch (status) {
    case VendorStatus.APPROVED:
      return "/dashboard";
    case VendorStatus.REJECTED:
      return "/account/rejected";
    case VendorStatus.SUSPENDED:
      return "/account/suspended";
    default:
      return "/onboarding";
  }
};
