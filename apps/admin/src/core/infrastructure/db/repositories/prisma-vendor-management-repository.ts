import "server-only";

import type {
  AdminVendorDetailDTO,
  AdminVendorListItemDTO,
  AdminVendorsQuery,
  AuditLogDTO,
  CreateAuditLogInput,
  MediaType,
} from "@wo/shared-types";

import {
  evaluateVendorVerificationChecklist,
  mapDtoVendorStatusToPrisma,
  mapPrismaVendorStatusToDto,
  type VendorPermissionFlags,
} from "@/core/domain/entities/vendor-management";
import type { VendorManagementRepository } from "@/core/domain/repositories";

import { prisma } from "../prisma";

type PrismaVendorListRecord = {
  id: string;
  name: string;
  ownerId: string;
  status: string;
  categoryId: string | null;
  phoneNumber: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    name: string | null;
    email: string;
  };
  category: {
    name: string;
  } | null;
};

const mapVendorListItem = (vendor: PrismaVendorListRecord): AdminVendorListItemDTO => ({
  id: vendor.id,
  name: vendor.name,
  status: mapPrismaVendorStatusToDto(vendor.status),
  categoryId: vendor.categoryId,
  categoryName: vendor.category?.name ?? null,
  ownerId: vendor.ownerId,
  ownerName: vendor.owner.name,
  ownerEmail: vendor.owner.email,
  phoneNumber: vendor.phoneNumber,
  deletedAt: vendor.deletedAt,
  createdAt: vendor.createdAt,
  updatedAt: vendor.updatedAt,
});

const toJsonValue = (value: unknown) => {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value));
};

export class PrismaVendorManagementRepository implements VendorManagementRepository {
  async getActorPermissionByMenuCode(
    actorId: string,
    menuCode: string
  ): Promise<VendorPermissionFlags | null> {
    const user = await prisma.user.findUnique({
      where: { id: actorId },
      select: {
        accessProfile: {
          select: {
            permissions: {
              where: {
                accessMenu: {
                  code: menuCode,
                },
              },
              select: {
                canView: true,
                canInsert: true,
                canUpdate: true,
                canUpsert: true,
                canDelete: true,
                canHistory: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    const permission = user?.accessProfile?.permissions?.[0];

    if (!permission) {
      return null;
    }

    return {
      canView: permission.canView,
      canInsert: permission.canInsert,
      canUpdate: permission.canUpdate,
      canUpsert: permission.canUpsert,
      canDelete: permission.canDelete,
      canHistory: permission.canHistory,
    };
  }

  async listVendors(
    query: Required<Pick<AdminVendorsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">> &
      Omit<AdminVendorsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">
  ): Promise<{ items: AdminVendorListItemDTO[]; totalItems: number }> {
    const skip = (query.page - 1) * query.pageSize;

    const where = {
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" as const } },
              { owner: { name: { contains: query.search, mode: "insensitive" as const } } },
              { owner: { email: { contains: query.search, mode: "insensitive" as const } } },
              { category: { name: { contains: query.search, mode: "insensitive" as const } } },
            ],
          }
        : {}),
      ...(query.status
        ? { status: mapDtoVendorStatusToPrisma(query.status) }
        : {}),
      ...(query.includeDeleted ? {} : { deletedAt: null }),
    };

    const orderBy = { [query.sortBy]: query.sortDirection } as Record<string, "asc" | "desc">;

    const [vendors, totalItems] = await prisma.$transaction([
      prisma.vendor.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy,
        include: {
          owner: {
            select: {
              name: true,
              email: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.vendor.count({ where }),
    ]);

    return {
      items: vendors.map((vendor) =>
        mapVendorListItem({
          ...vendor,
          status: vendor.status,
        })
      ),
      totalItems,
    };
  }

  async getVendorById(vendorId: string, includeDeleted = false): Promise<AdminVendorDetailDTO | null> {
    const vendor = await prisma.vendor.findFirst({
      where: {
        id: vendorId,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        services: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            isActive: true,
          },
        },
        portfolio: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            title: true,
            description: true,
            mediaUrl: true,
            mediaType: true,
          },
        },
      },
    });

    if (!vendor) {
      return null;
    }

    const checklist = evaluateVendorVerificationChecklist({
      businessName: vendor.name,
      categoryId: vendor.categoryId,
      phoneNumber: vendor.phoneNumber,
      serviceCount: vendor.services.length,
      portfolioCount: vendor.portfolio.length,
    });

    const history = await prisma.auditLog.findMany({
      where: {
        module: "VENDOR_MANAGEMENT",
        targetId: vendor.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return {
      ...mapVendorListItem({
        id: vendor.id,
        name: vendor.name,
        ownerId: vendor.ownerId,
        status: vendor.status,
        categoryId: vendor.categoryId,
        phoneNumber: vendor.phoneNumber,
        deletedAt: vendor.deletedAt,
        createdAt: vendor.createdAt,
        updatedAt: vendor.updatedAt,
        owner: vendor.owner,
        category: vendor.category,
      }),
      description: vendor.description,
      location: vendor.location,
      contactInfo: vendor.contactInfo,
      priceRange: vendor.priceRange,
      approvedAt: vendor.approvedAt,
      approvedBy: vendor.approvedBy,
      rejectedAt: vendor.rejectedAt,
      rejectedBy: vendor.rejectedBy,
      rejectionReason: vendor.rejectionReason,
      suspendedAt: vendor.suspendedAt,
      suspendedBy: vendor.suspendedBy,
      checklist,
      services: vendor.services,
      portfolio: vendor.portfolio.map((item) => ({
        ...item,
        mediaType: item.mediaType as MediaType,
      })),
      history: history.map((log) => ({
        id: log.id,
        actorId: log.actorId,
        module: log.module as AuditLogDTO["module"],
        action: log.action,
        targetId: log.targetId,
        beforeData: log.beforeData,
        afterData: log.afterData,
        createdAt: log.createdAt,
      })),
    };
  }

  async approveVendor(vendorId: string, actorId: string): Promise<AdminVendorDetailDTO> {
    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        approvedBy: actorId,
        rejectedAt: null,
        rejectedBy: null,
        rejectionReason: null,
        suspendedAt: null,
        suspendedBy: null,
      },
    });

    const vendor = await this.getVendorById(vendorId, true);
    if (!vendor) {
      throw new Error("Vendor not found");
    }

    return vendor;
  }

  async rejectVendor(vendorId: string, actorId: string, reason: string): Promise<AdminVendorDetailDTO> {
    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        rejectedBy: actorId,
        rejectionReason: reason,
      },
    });

    const vendor = await this.getVendorById(vendorId, true);
    if (!vendor) {
      throw new Error("Vendor not found");
    }

    return vendor;
  }

  async suspendVendor(vendorId: string, actorId: string): Promise<AdminVendorDetailDTO> {
    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        status: "SUSPENDED",
        suspendedAt: new Date(),
        suspendedBy: actorId,
      },
    });

    const vendor = await this.getVendorById(vendorId, true);
    if (!vendor) {
      throw new Error("Vendor not found");
    }

    return vendor;
  }

  async unsuspendVendor(vendorId: string): Promise<AdminVendorDetailDTO> {
    const current = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: {
        approvedAt: true,
      },
    });

    if (!current) {
      throw new Error("Vendor not found");
    }

    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        status: current.approvedAt ? "APPROVED" : "PENDING_VERIFICATION",
        suspendedAt: null,
        suspendedBy: null,
      },
    });

    const vendor = await this.getVendorById(vendorId, true);
    if (!vendor) {
      throw new Error("Vendor not found");
    }

    return vendor;
  }

  async softDeleteVendor(vendorId: string, actorId: string): Promise<AdminVendorDetailDTO> {
    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        deletedAt: new Date(),
        deletedBy: actorId,
      },
    });

    const vendor = await this.getVendorById(vendorId, true);
    if (!vendor) {
      throw new Error("Vendor not found");
    }

    return vendor;
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
      },
    });

    return {
      id: log.id,
      actorId: log.actorId,
      module: log.module as AuditLogDTO["module"],
      action: log.action,
      targetId: log.targetId,
      beforeData: log.beforeData,
      afterData: log.afterData,
      createdAt: log.createdAt,
    };
  }
}
