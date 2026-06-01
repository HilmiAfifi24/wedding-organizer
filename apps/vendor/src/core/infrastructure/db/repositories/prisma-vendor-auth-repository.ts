import "server-only";

import {
  AuditModule,
  Role,
  type AuditLogDTO,
  type CategoryDTO,
  type CreateAuditLogInput,
  type UpdateVendorOnboardingInput,
  type VendorOnboardingDTO,
  type VendorSessionDTO,
} from "@wo/shared-types";

import {
  evaluateVendorVerificationChecklist,
  mapPrismaVendorStatusToDto,
  resolveVendorOnboardingStatus,
} from "@/core/domain/entities/vendor-account";
import type {
  CreateVendorRegistrationRecordInput,
  VendorAuthRepository,
  VendorAuthUserRecord,
} from "@/core/domain/repositories";

import { prisma } from "../prisma";

const toJsonValue = (value: unknown) => {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value));
};

type VendorSessionRecord = {
  id: string;
  businessName: string | null;
  rejectionReason: string | null;
  rejectedAt: Date | null;
  suspendedAt: Date | null;
  owner: {
    id: string;
    email: string;
    name: string | null;
    role: "USER" | "VENDOR" | "ADMIN";
    suspendedAt: Date | null;
    deletedAt: Date | null;
  };
  status: "PENDING_VERIFICATION" | "APPROVED" | "REJECTED" | "SUSPENDED";
};

type VendorOnboardingRecord = {
  id: string;
  businessName: string | null;
  description: string | null;
  categoryId: string | null;
  phoneNumber: string | null;
  businessAddress: string | null;
  city: string | null;
  province: string | null;
  rejectionReason: string | null;
  rejectedAt: Date | null;
  suspendedAt: Date | null;
  status: "PENDING_VERIFICATION" | "APPROVED" | "REJECTED" | "SUSPENDED";
  owner: {
    id: string;
    email: string;
    name: string | null;
  };
  category: {
    id: string;
    name: string;
  } | null;
  _count: {
    services: number;
    portfolio: number;
  };
};

const mapVendorSession = (record: VendorSessionRecord): VendorSessionDTO => ({
  userId: record.owner.id,
  vendorId: record.id,
  email: record.owner.email,
  role: Role.VENDOR,
  vendorStatus: mapPrismaVendorStatusToDto(record.status),
  ownerName: record.owner.name,
  businessName: record.businessName,
  rejectionReason: record.rejectionReason,
  rejectedAt: record.rejectedAt,
  suspendedAt: record.suspendedAt,
});

const mapVendorOnboarding = (record: VendorOnboardingRecord): VendorOnboardingDTO => {
  const checklist = evaluateVendorVerificationChecklist({
    businessName: record.businessName,
    categoryId: record.categoryId,
    phoneNumber: record.phoneNumber,
    businessAddress: record.businessAddress,
    city: record.city,
    province: record.province,
    serviceCount: record._count.services,
    portfolioCount: record._count.portfolio,
  });

  return {
    vendorId: record.id,
    ownerName: record.owner.name,
    email: record.owner.email,
    status: mapPrismaVendorStatusToDto(record.status),
    onboardingStatus: resolveVendorOnboardingStatus(checklist),
    businessName: record.businessName,
    description: record.description,
    categoryId: record.categoryId,
    categoryName: record.category?.name ?? null,
    phoneNumber: record.phoneNumber,
    businessAddress: record.businessAddress,
    city: record.city,
    province: record.province,
    rejectionReason: record.rejectionReason,
    rejectedAt: record.rejectedAt,
    suspendedAt: record.suspendedAt,
    servicesCount: record._count.services,
    portfolioCount: record._count.portfolio,
    checklist,
  };
};

export class PrismaVendorAuthRepository implements VendorAuthRepository {
  async findAuthUserByEmail(email: string): Promise<VendorAuthUserRecord | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        role: true,
        deletedAt: true,
        suspendedAt: true,
        vendor: {
          select: {
            id: true,
            status: true,
            businessName: true,
            rejectedAt: true,
            rejectionReason: true,
            suspendedAt: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      vendorId: user.vendor?.id ?? null,
      email: user.email,
      ownerName: user.name ?? null,
      passwordHash: user.passwordHash ?? null,
      role: user.role as Role,
      vendorStatus: user.vendor?.status ?? null,
      businessName: user.vendor?.businessName ?? null,
      rejectionReason: user.vendor?.rejectionReason ?? null,
      rejectedAt: user.vendor?.rejectedAt ?? null,
      suspendedAt: user.vendor?.suspendedAt ?? null,
      userDeletedAt: user.deletedAt,
      userSuspendedAt: user.suspendedAt,
      vendorDeletedAt: user.vendor?.deletedAt ?? null,
    };
  }

  async isEmailTaken(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return Boolean(user);
  }

  async isPhoneNumberTaken(phoneNumber: string, excludeVendorId?: string): Promise<boolean> {
    const vendor = await prisma.vendor.findFirst({
      where: {
        phoneNumber,
        ...(excludeVendorId ? { id: { not: excludeVendorId } } : {}),
      },
      select: { id: true },
    });

    return Boolean(vendor);
  }

  async getCategoryById(categoryId: string): Promise<CategoryDTO | null> {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return null;
    }

    return category;
  }

  async listCategories(): Promise<CategoryDTO[]> {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  }

  async createVendorRegistration(
    input: CreateVendorRegistrationRecordInput
  ): Promise<{ userId: string; vendorId: string }> {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: input.ownerName,
          email: input.email,
          passwordHash: input.passwordHash,
          role: "VENDOR",
        },
      });

      const vendor = await tx.vendor.create({
        data: {
          ownerId: user.id,
          name: input.businessName,
          businessName: input.businessName,
          categoryId: input.categoryId,
          phoneNumber: input.phoneNumber,
          businessAddress: input.businessAddress,
          city: input.city,
          province: input.province,
          location: [input.businessAddress, input.city, input.province]
            .filter(Boolean)
            .join(", "),
          status: "PENDING_VERIFICATION",
        },
      });

      await tx.service.create({
        data: {
          vendorId: vendor.id,
          name: input.initialService.name,
          description: input.initialService.description,
          price: input.initialService.price,
          isActive: input.initialService.isActive ?? true,
        },
      });

      await tx.portfolio.create({
        data: {
          vendorId: vendor.id,
          title: input.initialPortfolio.title,
          description: input.initialPortfolio.description,
          mediaUrl: input.initialPortfolio.mediaUrl,
          mediaType: input.initialPortfolio.mediaType,
        },
      });

      return {
        userId: user.id,
        vendorId: vendor.id,
      };
    });
  }

  async getVendorSessionByUserId(userId: string): Promise<VendorSessionDTO | null> {
    const vendor = await prisma.vendor.findFirst({
      where: {
        ownerId: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        businessName: true,
        rejectionReason: true,
        rejectedAt: true,
        suspendedAt: true,
        status: true,
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            suspendedAt: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!vendor || vendor.owner.deletedAt || vendor.owner.suspendedAt) {
      return null;
    }

    return mapVendorSession(vendor);
  }

  async getVendorOnboardingByUserId(userId: string): Promise<VendorOnboardingDTO | null> {
    const vendor = await prisma.vendor.findFirst({
      where: {
        ownerId: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        businessName: true,
        description: true,
        categoryId: true,
        phoneNumber: true,
        businessAddress: true,
        city: true,
        province: true,
        rejectionReason: true,
        rejectedAt: true,
        suspendedAt: true,
        status: true,
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            services: true,
            portfolio: true,
          },
        },
      },
    });

    if (!vendor) {
      return null;
    }

    return mapVendorOnboarding(vendor);
  }

  async updateVendorOnboarding(
    vendorId: string,
    input: UpdateVendorOnboardingInput
  ): Promise<VendorOnboardingDTO> {
    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        name: input.businessName,
        businessName: input.businessName,
        description: input.description ?? null,
        categoryId: input.categoryId,
        phoneNumber: input.phoneNumber,
        businessAddress: input.businessAddress,
        city: input.city,
        province: input.province,
        location: [input.businessAddress, input.city, input.province]
          .filter(Boolean)
          .join(", "),
      },
    });

    const onboarding = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: {
        id: true,
        businessName: true,
        description: true,
        categoryId: true,
        phoneNumber: true,
        businessAddress: true,
        city: true,
        province: true,
        rejectionReason: true,
        rejectedAt: true,
        suspendedAt: true,
        status: true,
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            services: true,
            portfolio: true,
          },
        },
      },
    });

    if (!onboarding) {
      throw new Error("Vendor onboarding data not found");
    }

    return mapVendorOnboarding(onboarding);
  }

  async resubmitVendorForReview(vendorId: string): Promise<VendorOnboardingDTO> {
    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        status: "PENDING_VERIFICATION",
        rejectedAt: null,
        rejectedBy: null,
        rejectionReason: null,
      },
    });

    const onboarding = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: {
        id: true,
        businessName: true,
        description: true,
        categoryId: true,
        phoneNumber: true,
        businessAddress: true,
        city: true,
        province: true,
        rejectionReason: true,
        rejectedAt: true,
        suspendedAt: true,
        status: true,
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            services: true,
            portfolio: true,
          },
        },
      },
    });

    if (!onboarding) {
      throw new Error("Vendor onboarding data not found");
    }

    return mapVendorOnboarding(onboarding);
  }

  async createAuditLog(data: CreateAuditLogInput): Promise<AuditLogDTO> {
    const log = await prisma.auditLog.create({
      data: {
        actorId: data.actorId,
        module: data.module,
        action: data.action,
        targetId: data.targetId,
        beforeData: toJsonValue(data.beforeData),
        afterData: toJsonValue(data.afterData),
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
      },
    });

    return {
      id: log.id,
      actorId: log.actorId,
      module: log.module as AuditModule,
      action: log.action,
      targetId: log.targetId,
      beforeData: log.beforeData,
      afterData: log.afterData,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt,
    };
  }
}
