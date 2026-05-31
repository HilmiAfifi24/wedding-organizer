import type {
  AuditLogDTO,
  CategoryDTO,
  CreateAuditLogInput,
  Role,
  UpdateVendorOnboardingInput,
  VendorOnboardingDTO,
  VendorSessionDTO,
} from "@wo/shared-types";

export interface VendorAuthUserRecord {
  userId: string;
  vendorId: string | null;
  email: string;
  ownerName: string | null;
  passwordHash: string | null;
  role: Role;
  vendorStatus: string | null;
  businessName: string | null;
  rejectionReason: string | null;
  rejectedAt: Date | null;
  suspendedAt: Date | null;
  userDeletedAt: Date | null;
  userSuspendedAt: Date | null;
  vendorDeletedAt: Date | null;
}

export interface CreateVendorRegistrationRecordInput {
  ownerName: string;
  email: string;
  phoneNumber: string;
  passwordHash: string;
  businessName: string;
  categoryId: string;
  businessAddress: string;
  city: string;
  province: string;
}

export interface VendorAuthRepository {
  findAuthUserByEmail(email: string): Promise<VendorAuthUserRecord | null>;
  isEmailTaken(email: string): Promise<boolean>;
  isPhoneNumberTaken(phoneNumber: string, excludeVendorId?: string): Promise<boolean>;
  getCategoryById(categoryId: string): Promise<CategoryDTO | null>;
  listCategories(): Promise<CategoryDTO[]>;
  createVendorRegistration(
    input: CreateVendorRegistrationRecordInput
  ): Promise<{ userId: string; vendorId: string }>;
  getVendorSessionByUserId(userId: string): Promise<VendorSessionDTO | null>;
  getVendorOnboardingByUserId(userId: string): Promise<VendorOnboardingDTO | null>;
  updateVendorOnboarding(
    vendorId: string,
    input: UpdateVendorOnboardingInput
  ): Promise<VendorOnboardingDTO>;
  resubmitVendorForReview(vendorId: string): Promise<VendorOnboardingDTO>;
  createAuditLog(data: CreateAuditLogInput): Promise<AuditLogDTO>;
}
