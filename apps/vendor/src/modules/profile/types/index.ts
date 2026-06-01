import type { VendorProfileDTO, VendorStatus, VendorVerificationChecklistDTO } from "@wo/shared-types";

export type VendorProfile = VendorProfileDTO;

export interface VendorProfilePayload {
  businessName: string;
  description?: string;
  categoryId: string;
  businessType?: string;
  establishedYear?: number;
  phoneNumber: string;
  whatsappNumber?: string;
  website?: string;
  businessAddress: string;
  city: string;
  province: string;
  postalCode?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
}

export interface VendorProfileResubmitPayload {
  confirmation: true;
  note?: string;
}

export const VENDOR_STATUS_LABEL: Record<VendorStatus, string> = {
  pending_verification: "Pending Verification",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
};

export interface VendorChecklistViewModel extends VendorVerificationChecklistDTO {
  completedItems: number;
  totalItems: number;
  progressPercentage: number;
}
