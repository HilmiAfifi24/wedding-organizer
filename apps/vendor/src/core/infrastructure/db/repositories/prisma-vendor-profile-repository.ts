import "server-only";

import {
  AuditModule,
  VendorStatus,
  type AuditLogDTO,
  type CategoryDTO,
  type CreateAuditLogInput,
  type VendorProfileDTO,
  type VendorVerificationChecklistDTO,
} from "@wo/shared-types";

import {
  evaluateVendorVerificationChecklist,
  mapPrismaVendorStatusToDto,
  resolveVendorOnboardingStatus,
} from "@/core/domain/entities/vendor-account";
import type {
  UpdateVendorProfileRecordInput,
  VendorProfileRepository,
} from "@/core/domain/repositories/vendor-profile-repository";

import { prisma } from "../prisma";

const toJsonValue = (value: unknown) => {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value));
};

const vendorProfileSelect = {
  id: true,
  businessName: true,
  description: true,
  businessType: true,
  establishedYear: true,
  categoryId: true,
  phoneNumber: true,
  whatsappNumber: true,
  website: true,
  businessAddress: true,
  city: true,
  province: true,
  postalCode: true,
  logoUrl: true,
  coverImageUrl: true,
  instagramUrl: true,
  tiktokUrl: true,
  facebookUrl: true,
  youtubeUrl: true,
  status: true,
  rejectionReason: true,
  approvedAt: true,
  approvedBy: true,
  rejectedAt: true,
  rejectedBy: true,
  resubmittedAt: true,
  suspendedAt: true,
  suspensionReason: true,
  owner: {
    select: {
      id: true,
      name: true,
      email: true,
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
} as const;

type VendorProfileRecord = {
  id: string;
  businessName: string | null;
  description: string | null;
  businessType: string | null;
  establishedYear: number | null;
  categoryId: string | null;
  phoneNumber: string | null;
  whatsappNumber: string | null;
  website: string | null;
  businessAddress: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  status: "PENDING_VERIFICATION" | "APPROVED" | "REJECTED" | "SUSPENDED";
  rejectionReason: string | null;
  approvedAt: Date | null;
  approvedBy: string | null;
  rejectedAt: Date | null;
  rejectedBy: string | null;
  resubmittedAt: Date | null;
  suspendedAt: Date | null;
  suspensionReason: string | null;
  owner: {
    id: string;
    name: string | null;
    email: string;
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

const mapVendorProfile = (record: VendorProfileRecord): VendorProfileDTO => {
  const checklist: VendorVerificationChecklistDTO = evaluateVendorVerificationChecklist({
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
    businessType: record.businessType,
    establishedYear: record.establishedYear,
    categoryId: record.categoryId,
    categoryName: record.category?.name ?? null,
    phoneNumber: record.phoneNumber,
    whatsappNumber: record.whatsappNumber,
    website: record.website,
    businessAddress: record.businessAddress,
    city: record.city,
    province: record.province,
    postalCode: record.postalCode,
    logoUrl: record.logoUrl,
    coverImageUrl: record.coverImageUrl,
    instagramUrl: record.instagramUrl,
    tiktokUrl: record.tiktokUrl,
    facebookUrl: record.facebookUrl,
    youtubeUrl: record.youtubeUrl,
    rejectionReason: record.status === "REJECTED" ? record.rejectionReason : null,
    rejectedAt: record.status === "REJECTED" ? record.rejectedAt : null,
    approvedAt: record.approvedAt,
    approvedById: record.approvedBy,
    rejectedById: record.rejectedBy,
    resubmittedAt: record.resubmittedAt,
    suspendedAt: record.suspendedAt,
    suspensionReason: record.suspensionReason,
    servicesCount: record._count.services,
    portfolioCount: record._count.portfolio,
    checklist,
  };
};

const mapDtoVendorStatusToPrisma = (
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

export class PrismaVendorProfileRepository implements VendorProfileRepository {
  async getByUserId(userId: string): Promise<VendorProfileDTO | null> {
    const vendor = await prisma.vendor.findFirst({
      where: {
        ownerId: userId,
        deletedAt: null,
      },
      select: vendorProfileSelect,
    });

    if (!vendor) {
      return null;
    }

    return mapVendorProfile(vendor as VendorProfileRecord);
  }

  async getByVendorId(vendorId: string): Promise<VendorProfileDTO | null> {
    const vendor = await prisma.vendor.findUnique({
      where: {
        id: vendorId,
      },
      select: vendorProfileSelect,
    });

    if (!vendor) {
      return null;
    }

    return mapVendorProfile(vendor as VendorProfileRecord);
  }

  async getChecklistByVendorId(vendorId: string): Promise<VendorVerificationChecklistDTO> {
    const profile = await this.getByVendorId(vendorId);

    if (!profile) {
      throw new Error("Vendor profile not found");
    }

    return profile.checklist;
  }

  async listCategories(): Promise<CategoryDTO[]> {
    return prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }

  async getCategoryById(categoryId: string): Promise<CategoryDTO | null> {
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    return category;
  }

  async isPhoneNumberTaken(phoneNumber: string, excludeVendorId?: string): Promise<boolean> {
    const vendor = await prisma.vendor.findFirst({
      where: {
        phoneNumber,
        ...(excludeVendorId ? { id: { not: excludeVendorId } } : {}),
      },
      select: {
        id: true,
      },
    });

    return Boolean(vendor);
  }

  async updateProfile(
    vendorId: string,
    input: UpdateVendorProfileRecordInput,
    options?: {
      nextStatus?: VendorStatus;
      resetApprovalMetadata?: boolean;
      touchResubmittedAt?: boolean;
    }
  ): Promise<VendorProfileDTO> {
    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        name: input.businessName,
        businessName: input.businessName,
        description: input.description?.trim() || null,
        categoryId: input.categoryId,
        businessType: input.businessType?.trim() || null,
        establishedYear: input.establishedYear ?? null,
        phoneNumber: input.phoneNumber,
        whatsappNumber: input.whatsappNumber?.trim() || null,
        website: input.website?.trim() || null,
        businessAddress: input.businessAddress,
        city: input.city,
        province: input.province,
        postalCode: input.postalCode?.trim() || null,
        instagramUrl: input.instagramUrl?.trim() || null,
        tiktokUrl: input.tiktokUrl?.trim() || null,
        facebookUrl: input.facebookUrl?.trim() || null,
        youtubeUrl: input.youtubeUrl?.trim() || null,
        location: [input.businessAddress, input.city, input.province].filter(Boolean).join(", "),
        ...(options?.nextStatus
          ? {
              status: mapDtoVendorStatusToPrisma(options.nextStatus),
            }
          : {}),
        ...(options?.resetApprovalMetadata
          ? {
              approvedAt: null,
              approvedBy: null,
            }
          : {}),
        ...(options?.touchResubmittedAt
          ? {
              resubmittedAt: new Date(),
            }
          : {}),
      },
    });

    const updated = await this.getByVendorId(vendorId);

    if (!updated) {
      throw new Error("Vendor profile not found");
    }

    return updated;
  }

  async updateProfileMedia(
    vendorId: string,
    input: {
      logoUrl?: string;
      coverImageUrl?: string;
    }
  ): Promise<VendorProfileDTO> {
    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        ...(input.logoUrl !== undefined
          ? {
              logoUrl: input.logoUrl,
            }
          : {}),
        ...(input.coverImageUrl !== undefined
          ? {
              coverImageUrl: input.coverImageUrl,
            }
          : {}),
      },
    });

    const updated = await this.getByVendorId(vendorId);

    if (!updated) {
      throw new Error("Vendor profile not found");
    }

    return updated;
  }

  async resubmit(vendorId: string): Promise<VendorProfileDTO> {
    await prisma.vendor.update({
      where: {
        id: vendorId,
      },
      data: {
        status: "PENDING_VERIFICATION",
        resubmittedAt: new Date(),
      },
    });

    const updated = await this.getByVendorId(vendorId);

    if (!updated) {
      throw new Error("Vendor profile not found");
    }

    return updated;
  }

  async createAuditLog(data: CreateAuditLogInput): Promise<AuditLogDTO> {
    const auditLog = await prisma.auditLog.create({
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
      id: auditLog.id,
      actorId: auditLog.actorId,
      module: auditLog.module as AuditModule,
      action: auditLog.action,
      targetId: auditLog.targetId,
      beforeData: auditLog.beforeData,
      afterData: auditLog.afterData,
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      createdAt: auditLog.createdAt,
    };
  }
}
