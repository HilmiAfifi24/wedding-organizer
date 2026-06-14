import bcrypt from "bcryptjs";
import {
  AuditModule,
  MediaType,
  Role,
  VendorOnboardingStatus,
  VendorStatus,
  type CategoryDTO,
  type UpdateVendorOnboardingInput,
  type VendorOnboardingDTO,
  type VendorRegistrationInput,
  type VendorSessionDTO,
} from "@wo/shared-types";

import type { VendorAuthRepository } from "@/core/domain/repositories";

const ensureVendorSession = (session: VendorSessionDTO | null) => {
  if (!session) {
    throw new Error("Unauthorized: vendor session not found");
  }

  return session;
};

export class ListVendorCategoriesUseCase {
  constructor(private readonly repository: VendorAuthRepository) {}

  async execute(): Promise<CategoryDTO[]> {
    return this.repository.listCategories();
  }
}

export class RegisterVendorUseCase {
  constructor(private readonly repository: VendorAuthRepository) {}

  async execute(input: VendorRegistrationInput): Promise<VendorSessionDTO> {
    if (await this.repository.isEmailTaken(input.email)) {
      throw new Error("Email sudah terdaftar");
    }

    if (await this.repository.isPhoneNumberTaken(input.phoneNumber)) {
      throw new Error("Nomor telepon sudah digunakan");
    }

    const category = await this.repository.getCategoryById(input.categoryId);
    if (!category) {
      throw new Error("Kategori vendor tidak ditemukan");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const created = await this.repository.createVendorRegistration({
      ownerName: input.ownerName,
      email: input.email,
      phoneNumber: input.phoneNumber,
      passwordHash,
      businessName: input.businessName,
      categoryId: input.categoryId,
      businessAddress: input.businessAddress,
      city: input.city,
      province: input.province,
      initialService: {
        name: input.initialService.name.trim(),
        description: input.initialService.description?.trim() || undefined,
        price: input.initialService.price,
        isActive: input.initialService.isActive ?? true,
      },
      initialPortfolio: {
        title: input.initialPortfolio.title?.trim() || undefined,
        description: input.initialPortfolio.description?.trim() || undefined,
        mediaUrl: input.initialPortfolio.mediaUrl.trim(),
        mediaType:
          input.initialPortfolio.mediaType === MediaType.VIDEO
            ? MediaType.VIDEO
            : MediaType.IMAGE,
      },
    });

    const session = await this.repository.getVendorSessionByUserId(created.userId);
    const currentSession = ensureVendorSession(session);

    await this.repository.createAuditLog({
      actorId: created.userId,
      module: AuditModule.VENDOR_MANAGEMENT,
      action: "VENDOR_REGISTRATION",
      targetId: created.vendorId,
      afterData: {
        vendorId: created.vendorId,
        email: input.email,
        businessName: input.businessName,
        status: VendorStatus.PENDING_VERIFICATION,
        initialService: {
          name: input.initialService.name,
          price: input.initialService.price,
        },
        initialPortfolio: {
          mediaType: input.initialPortfolio.mediaType,
          mediaUrlKind: input.initialPortfolio.mediaUrl.trim().startsWith("data:")
            ? "inline-data-url"
            : "external-url",
        },
      },
    });

    return currentSession;
  }
}

export class AuthenticateVendorUseCase {
  constructor(private readonly repository: VendorAuthRepository) {}

  async execute(email: string, password: string): Promise<VendorSessionDTO | null> {
    const authRecord = await this.repository.findAuthUserByEmail(email);
    if (!authRecord || !authRecord.passwordHash || authRecord.role !== Role.VENDOR) {
      return null;
    }

    if (
      authRecord.userDeletedAt ||
      authRecord.userSuspendedAt ||
      authRecord.vendorDeletedAt ||
      !authRecord.vendorId ||
      !authRecord.vendorStatus
    ) {
      return null;
    }

    const valid = await bcrypt.compare(password, authRecord.passwordHash);
    if (!valid) {
      return null;
    }

    const session = await this.repository.getVendorSessionByUserId(authRecord.userId);
    if (!session) {
      return null;
    }

    await this.repository.createAuditLog({
      actorId: session.userId,
      module: AuditModule.VENDOR_MANAGEMENT,
      action: "VENDOR_LOGIN",
      targetId: session.vendorId,
      afterData: {
        vendorStatus: session.vendorStatus,
      },
    });

    return session;
  }
}

export class GetVendorSessionUseCase {
  constructor(private readonly repository: VendorAuthRepository) {}

  async execute(userId: string): Promise<VendorSessionDTO> {
    const session = await this.repository.getVendorSessionByUserId(userId);
    return ensureVendorSession(session);
  }
}

export class GetVendorOnboardingUseCase {
  constructor(private readonly repository: VendorAuthRepository) {}

  async execute(userId: string): Promise<VendorOnboardingDTO> {
    const onboarding = await this.repository.getVendorOnboardingByUserId(userId);

    if (!onboarding) {
      throw new Error("Vendor onboarding data not found");
    }

    return onboarding;
  }
}

export class UpdateVendorOnboardingUseCase {
  constructor(private readonly repository: VendorAuthRepository) {}

  async execute(userId: string, input: UpdateVendorOnboardingInput): Promise<VendorOnboardingDTO> {
    const current = await this.repository.getVendorOnboardingByUserId(userId);

    if (!current) {
      throw new Error("Vendor onboarding data not found");
    }

    if (current.status === VendorStatus.SUSPENDED) {
      throw new Error("Forbidden: suspended vendor cannot update onboarding");
    }

    if (await this.repository.isPhoneNumberTaken(input.phoneNumber, current.vendorId)) {
      throw new Error("Nomor telepon sudah digunakan");
    }

    const category = await this.repository.getCategoryById(input.categoryId);
    if (!category) {
      throw new Error("Kategori vendor tidak ditemukan");
    }

    const updated = await this.repository.updateVendorOnboarding(current.vendorId, input);

    await this.repository.createAuditLog({
      actorId: userId,
      module: AuditModule.VENDOR_MANAGEMENT,
      action: "VENDOR_ONBOARDING_UPDATE",
      targetId: current.vendorId,
      beforeData: current,
      afterData: updated,
    });

    if (
      current.status === VendorStatus.REJECTED &&
      updated.onboardingStatus === VendorOnboardingStatus.READY_FOR_REVIEW
    ) {
      const resubmitted = await this.repository.resubmitVendorForReview(current.vendorId);

      await this.repository.createAuditLog({
        actorId: userId,
        module: AuditModule.VENDOR_MANAGEMENT,
        action: "VENDOR_RESUBMISSION",
        targetId: current.vendorId,
        beforeData: {
          status: current.status,
          rejectionReason: current.rejectionReason,
        },
        afterData: {
          status: resubmitted.status,
          onboardingStatus: resubmitted.onboardingStatus,
        },
      });

      return resubmitted;
    }

    return updated;
  }
}
