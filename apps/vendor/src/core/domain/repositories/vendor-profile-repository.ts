import type {
  AuditLogDTO,
  CategoryDTO,
  CreateAuditLogInput,
  VendorProfileDTO,
  VendorVerificationChecklistDTO,
  VendorStatus,
} from "@wo/shared-types";

export interface UpdateVendorProfileRecordInput {
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

export interface VendorProfileRepository {
  getByUserId(userId: string): Promise<VendorProfileDTO | null>;
  getByVendorId(vendorId: string): Promise<VendorProfileDTO | null>;
  getChecklistByVendorId(vendorId: string): Promise<VendorVerificationChecklistDTO>;
  listCategories(): Promise<CategoryDTO[]>;
  getCategoryById(categoryId: string): Promise<CategoryDTO | null>;
  isPhoneNumberTaken(phoneNumber: string, excludeVendorId?: string): Promise<boolean>;
  updateProfile(
    vendorId: string,
    input: UpdateVendorProfileRecordInput,
    options?: {
      nextStatus?: VendorStatus;
      resetApprovalMetadata?: boolean;
      touchResubmittedAt?: boolean;
    }
  ): Promise<VendorProfileDTO>;
  updateProfileMedia(
    vendorId: string,
    input: {
      logoUrl?: string;
      coverImageUrl?: string;
    }
  ): Promise<VendorProfileDTO>;
  resubmit(vendorId: string): Promise<VendorProfileDTO>;
  createAuditLog(data: CreateAuditLogInput): Promise<AuditLogDTO>;
}
