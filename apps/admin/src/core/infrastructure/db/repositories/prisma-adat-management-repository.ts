import "server-only";

import type {
  AdminAdatsQuery,
  AdminAdatListItemDTO,
  AuditLogDTO,
  CreateAuditLogInput,
} from "@wo/shared-types";
import { AuditModule } from "@wo/shared-types";

import type { AdatPermissionFlags } from "@/core/domain/entities/adat-management";
import type { AdatManagementRepository } from "@/core/domain/repositories";

import { prisma } from "../prisma";

const toJsonValue = (value: unknown) => {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value));
};

const mapAdat = (adat: {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    services: number;
  };
}): AdminAdatListItemDTO => ({
  id: adat.id,
  name: adat.name,
  serviceCount: adat._count.services,
  createdAt: adat.createdAt,
  updatedAt: adat.updatedAt,
});

export class PrismaAdatManagementRepository implements AdatManagementRepository {
  async getActorPermissionByMenuCode(
    actorId: string,
    menuCode: string
  ): Promise<AdatPermissionFlags | null> {
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

  async listAdats(
    query: Required<Pick<AdminAdatsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">> &
      Omit<AdminAdatsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">
  ): Promise<{ items: AdminAdatListItemDTO[]; totalItems: number }> {
    const where = query.search
      ? {
          name: {
            contains: query.search,
            mode: "insensitive" as const,
          },
        }
      : undefined;

    const [totalItems, items] = await Promise.all([
      prisma.adat.count({ where }),
      prisma.adat.findMany({
        where,
        include: {
          _count: {
            select: {
              services: true,
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
      items: items.map(mapAdat),
      totalItems,
    };
  }

  async getAdatById(adatId: string): Promise<AdminAdatListItemDTO | null> {
    const adat = await prisma.adat.findUnique({
      where: { id: adatId },
      include: {
        _count: {
          select: {
            services: true,
          },
        },
      },
    });

    return adat ? mapAdat(adat) : null;
  }

  async getAdatByName(
    name: string,
    options?: { excludeId?: string }
  ): Promise<AdminAdatListItemDTO | null> {
    const adat = await prisma.adat.findFirst({
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
            services: true,
          },
        },
      },
    });

    return adat ? mapAdat(adat) : null;
  }

  async createAdat(data: { name: string }): Promise<AdminAdatListItemDTO> {
    const adat = await prisma.adat.create({
      data,
      include: {
        _count: {
          select: {
            services: true,
          },
        },
      },
    });

    return mapAdat(adat);
  }

  async updateAdat(
    adatId: string,
    data: { name: string }
  ): Promise<AdminAdatListItemDTO> {
    const adat = await prisma.adat.update({
      where: { id: adatId },
      data,
      include: {
        _count: {
          select: {
            services: true,
          },
        },
      },
    });

    return mapAdat(adat);
  }

  async deleteAdat(adatId: string): Promise<void> {
    await prisma.adat.delete({
      where: { id: adatId },
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
