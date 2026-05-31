import "server-only";

import type {
  AdminCategoriesQuery,
  AdminCategoryListItemDTO,
  AuditLogDTO,
  CreateAuditLogInput,
  UpdateCategoryInput,
} from "@wo/shared-types";
import { AuditModule } from "@wo/shared-types";

import type { CategoryPermissionFlags } from "@/core/domain/entities/category-management";
import type { CategoryManagementRepository } from "@/core/domain/repositories";

import { prisma } from "../prisma";

const toJsonValue = (value: unknown) => {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value));
};

const mapCategory = (category: {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    vendors: number;
  };
}): AdminCategoryListItemDTO => ({
  id: category.id,
  name: category.name,
  vendorCount: category._count.vendors,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
});

export class PrismaCategoryManagementRepository implements CategoryManagementRepository {
  async getActorPermissionByMenuCode(
    actorId: string,
    menuCode: string
  ): Promise<CategoryPermissionFlags | null> {
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
                canDelete: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    const permission = user?.accessProfile?.permissions[0];
    if (!permission) {
      return null;
    }

    return permission;
  }

  async listCategories(
    query: Required<Pick<AdminCategoriesQuery, "page" | "pageSize" | "sortBy" | "sortDirection">> &
      Omit<AdminCategoriesQuery, "page" | "pageSize" | "sortBy" | "sortDirection">
  ): Promise<{ items: AdminCategoryListItemDTO[]; totalItems: number }> {
    const where = query.search
      ? {
          name: {
            contains: query.search,
            mode: "insensitive" as const,
          },
        }
      : undefined;

    const [totalItems, items] = await Promise.all([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        include: {
          _count: {
            select: {
              vendors: true,
            },
          },
        },
        orderBy: {
          [query.sortBy]: query.sortDirection,
        },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return {
      items: items.map(mapCategory),
      totalItems,
    };
  }

  async getCategoryById(categoryId: string): Promise<AdminCategoryListItemDTO | null> {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            vendors: true,
          },
        },
      },
    });

    return category ? mapCategory(category) : null;
  }

  async getCategoryByName(
    name: string,
    options?: { excludeId?: string }
  ): Promise<AdminCategoryListItemDTO | null> {
    const category = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
        ...(options?.excludeId
          ? {
              id: {
                not: options.excludeId,
              },
            }
          : {}),
      },
      include: {
        _count: {
          select: {
            vendors: true,
          },
        },
      },
    });

    return category ? mapCategory(category) : null;
  }

  async createCategory(data: { name: string }): Promise<AdminCategoryListItemDTO> {
    const category = await prisma.category.create({
      data,
      include: {
        _count: {
          select: {
            vendors: true,
          },
        },
      },
    });

    return mapCategory(category);
  }

  async updateCategory(
    categoryId: string,
    data: UpdateCategoryInput
  ): Promise<AdminCategoryListItemDTO> {
    const category = await prisma.category.update({
      where: { id: categoryId },
      data,
      include: {
        _count: {
          select: {
            vendors: true,
          },
        },
      },
    });

    return mapCategory(category);
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await prisma.category.delete({
      where: { id: categoryId },
    });
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
