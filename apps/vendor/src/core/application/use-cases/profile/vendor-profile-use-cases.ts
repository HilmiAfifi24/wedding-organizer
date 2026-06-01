import { AuditModule, VendorStatus, type VendorProfileDTO } from "@wo/shared-types";

import type { FileStorageService } from "@/core/domain/services/file-storage-service";
import type {
  UpdateVendorProfileRecordInput,
  VendorProfileRepository,
} from "@/core/domain/repositories/vendor-profile-repository";

const normalize = (value?: string | null) => (value ?? "").trim();

const isCriticalChange = (before: VendorProfileDTO, input: UpdateVendorProfileRecordInput) => {
  return (
    normalize(before.businessName) !== normalize(input.businessName) ||
    normalize(before.categoryId) !== normalize(input.categoryId) ||
    normalize(before.phoneNumber) !== normalize(input.phoneNumber) ||
    normalize(before.businessAddress) !== normalize(input.businessAddress) ||
    normalize(before.city) !== normalize(input.city) ||
    normalize(before.province) !== normalize(input.province)
  );
};

const assertProfileEditable = (status: VendorStatus) => {
  if (status === VendorStatus.SUSPENDED) {
    throw new Error("Forbidden: suspended vendor cannot edit profile");
  }
};

const buildProfileAction = (isCritical: boolean) =>
  isCritical ? "CRITICAL_PROFILE_UPDATE" : "VENDOR_PROFILE_UPDATE";

const ensureUrl = (value?: string) => {
  if (!value || !value.trim()) {
    return undefined;
  }

  const parsed = new URL(value.trim());
  return parsed.toString();
};

export class GetVendorProfileUseCase {
  constructor(private readonly repository: VendorProfileRepository) {}

  async execute(userId: string): Promise<VendorProfileDTO> {
    const profile = await this.repository.getByUserId(userId);

    if (!profile) {
      throw new Error("Vendor profile not found");
    }

    return profile;
  }
}

export class GetVendorChecklistUseCase {
  constructor(private readonly repository: VendorProfileRepository) {}

  async execute(vendorId: string) {
    return this.repository.getChecklistByVendorId(vendorId);
  }
}

export class ListVendorProfileCategoriesUseCase {
  constructor(private readonly repository: VendorProfileRepository) {}

  async execute() {
    return this.repository.listCategories();
  }
}

export class UpdateVendorProfileUseCase {
  constructor(private readonly repository: VendorProfileRepository) {}

  async execute(userId: string, input: UpdateVendorProfileRecordInput) {
    const current = await this.repository.getByUserId(userId);

    if (!current) {
      throw new Error("Vendor profile not found");
    }

    assertProfileEditable(current.status);

    const category = await this.repository.getCategoryById(input.categoryId);
    if (!category) {
      throw new Error("Kategori vendor tidak ditemukan");
    }

    if (await this.repository.isPhoneNumberTaken(input.phoneNumber, current.vendorId)) {
      throw new Error("Nomor telepon sudah digunakan");
    }

    const normalizedInput = {
      ...input,
      website: ensureUrl(input.website),
      instagramUrl: ensureUrl(input.instagramUrl),
      tiktokUrl: ensureUrl(input.tiktokUrl),
      facebookUrl: ensureUrl(input.facebookUrl),
      youtubeUrl: ensureUrl(input.youtubeUrl),
    };

    const criticalChanged = isCriticalChange(current, normalizedInput);

    const nextStatus =
      current.status === VendorStatus.APPROVED && criticalChanged
        ? VendorStatus.PENDING_VERIFICATION
        : current.status;

    const updated = await this.repository.updateProfile(current.vendorId, normalizedInput, {
      nextStatus,
      resetApprovalMetadata: current.status === VendorStatus.APPROVED && criticalChanged,
      touchResubmittedAt: current.status === VendorStatus.APPROVED && criticalChanged,
    });

    await this.repository.createAuditLog({
      actorId: userId,
      module: AuditModule.VENDOR_PROFILE,
      action: buildProfileAction(criticalChanged),
      targetId: current.vendorId,
      beforeData: current,
      afterData: updated,
    });

    return updated;
  }
}

export class UpdateVendorLogoUseCase {
  constructor(
    private readonly repository: VendorProfileRepository,
    private readonly fileStorage: FileStorageService
  ) {}

  async execute(userId: string, file: File) {
    const current = await this.repository.getByUserId(userId);

    if (!current) {
      throw new Error("Vendor profile not found");
    }

    assertProfileEditable(current.status);

    const uploadedUrl = await this.fileStorage.upload(file);

    if (current.logoUrl) {
      await this.fileStorage.delete(current.logoUrl);
    }

    const updated = await this.repository.updateProfileMedia(current.vendorId, {
      logoUrl: uploadedUrl,
    });

    await this.repository.createAuditLog({
      actorId: userId,
      module: AuditModule.VENDOR_PROFILE,
      action: "VENDOR_LOGO_UPDATED",
      targetId: current.vendorId,
      beforeData: { logoUrl: current.logoUrl },
      afterData: { logoUrl: updated.logoUrl },
    });

    return updated;
  }
}

export class UpdateVendorCoverUseCase {
  constructor(
    private readonly repository: VendorProfileRepository,
    private readonly fileStorage: FileStorageService
  ) {}

  async execute(userId: string, file: File) {
    const current = await this.repository.getByUserId(userId);

    if (!current) {
      throw new Error("Vendor profile not found");
    }

    assertProfileEditable(current.status);

    const uploadedUrl = await this.fileStorage.upload(file);

    if (current.coverImageUrl) {
      await this.fileStorage.delete(current.coverImageUrl);
    }

    const updated = await this.repository.updateProfileMedia(current.vendorId, {
      coverImageUrl: uploadedUrl,
    });

    await this.repository.createAuditLog({
      actorId: userId,
      module: AuditModule.VENDOR_PROFILE,
      action: "VENDOR_COVER_UPDATED",
      targetId: current.vendorId,
      beforeData: { coverImageUrl: current.coverImageUrl },
      afterData: { coverImageUrl: updated.coverImageUrl },
    });

    return updated;
  }
}

export class ResubmitVendorProfileUseCase {
  constructor(private readonly repository: VendorProfileRepository) {}

  async execute(userId: string, note?: string) {
    const current = await this.repository.getByUserId(userId);

    if (!current) {
      throw new Error("Vendor profile not found");
    }

    assertProfileEditable(current.status);

    if (current.status !== VendorStatus.REJECTED) {
      throw new Error("Only rejected vendor can resubmit profile");
    }

    if (!current.checklist.isComplete) {
      throw new Error("Checklist verifikasi belum lengkap");
    }

    const updated = await this.repository.resubmit(current.vendorId);

    await this.repository.createAuditLog({
      actorId: userId,
      module: AuditModule.VENDOR_PROFILE,
      action: "VENDOR_PROFILE_RESUBMITTED",
      targetId: current.vendorId,
      beforeData: current,
      afterData: {
        ...updated,
        note: note?.trim() || null,
      },
    });

    return updated;
  }
}
