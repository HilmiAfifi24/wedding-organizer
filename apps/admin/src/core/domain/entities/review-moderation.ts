import { ReviewStatus, VendorStatus } from "@wo/shared-types";

export interface ReviewModerationPermissionFlags {
  canView: boolean;
  canInsert: boolean;
  canUpdate: boolean;
  canUpsert: boolean;
  canDelete: boolean;
  canHistory: boolean;
}

export const REVIEW_MODERATION_MENU_CODE = "REVIEW_MODERATION";

export const mapPrismaReviewStatusToDto = (status: string): ReviewStatus => {
  switch (status) {
    case "HIDDEN":
      return ReviewStatus.HIDDEN;
    case "DELETED":
      return ReviewStatus.DELETED;
    default:
      return ReviewStatus.VISIBLE;
  }
};

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
