import "server-only";

import {
  AuditModule,
} from "@wo/shared-types";
import type {
  AdminAuditLogDetailDTO,
  AdminAuditLogListItemDTO,
  AdminAuditLogsQuery,
} from "@wo/shared-types";

import {
  inferAuditTargetPath,
  sanitizeAuditValue,
  type AuditLogDashboardPermissionFlags,
} from "@/core/domain/entities/audit-log-dashboard";
import type { AuditLogDashboardRepository } from "@/core/domain/repositories";

import { prisma } from "../prisma";

const mapAuditModule = (module: string) => module as AuditModule;

const mapAuditLog = (auditLog: {
  id: string;
  actorId: string;
  module: string;
  action: string;
  targetId: string;
  beforeData: unknown;
  afterData: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  actor: {
    name: string | null;
    email: string;
  };
}): AdminAuditLogListItemDTO => ({
  id: auditLog.id,
  actorId: auditLog.actorId,
  module: mapAuditModule(auditLog.module),
  action: auditLog.action,
  targetId: auditLog.targetId,
  beforeData: sanitizeAuditValue(auditLog.beforeData),
  afterData: sanitizeAuditValue(auditLog.afterData),
  ipAddress: auditLog.ipAddress,
  userAgent: auditLog.userAgent,
  createdAt: auditLog.createdAt,
  actorName: auditLog.actor.name,
  actorEmail: auditLog.actor.email,
  targetPath: inferAuditTargetPath(mapAuditModule(auditLog.module), auditLog.targetId),
});

export class PrismaAuditLogDashboardRepository implements AuditLogDashboardRepository {
  async getActorPermissionByMenuCode(
    actorId: string,
    menuCode: string
  ): Promise<AuditLogDashboardPermissionFlags | null> {
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

  async listAuditLogs(
    query: Required<Pick<AdminAuditLogsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">> &
      Omit<AdminAuditLogsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">
  ): Promise<{ items: AdminAuditLogListItemDTO[]; totalItems: number }> {
    const skip = (query.page - 1) * query.pageSize;
    const matchedModules = query.search
      ? Object.values(AuditModule).filter((module) =>
          module.toLowerCase().includes(query.search!.toLowerCase())
        )
      : [];

    const andConditions: Array<Record<string, unknown>> = [];

    if (query.search) {
      const orConditions: Array<Record<string, unknown>> = [
        { action: { contains: query.search, mode: "insensitive" as const } },
        { targetId: { contains: query.search, mode: "insensitive" as const } },
        { actor: { name: { contains: query.search, mode: "insensitive" as const } } },
        { actor: { email: { contains: query.search, mode: "insensitive" as const } } },
      ];

      if (matchedModules.length > 0) {
        orConditions.push({
          module: {
            in: matchedModules,
          },
        });
      }

      andConditions.push({ OR: orConditions });
    }

    if (query.module) {
      andConditions.push({ module: query.module });
    }

    if (query.action) {
      andConditions.push({ action: { contains: query.action, mode: "insensitive" as const } });
    }

    if (query.actor) {
      andConditions.push({
        OR: [
          { actor: { name: { contains: query.actor, mode: "insensitive" as const } } },
          { actor: { email: { contains: query.actor, mode: "insensitive" as const } } },
        ],
      });
    }

    if (query.dateFrom || query.dateTo) {
      andConditions.push({
        createdAt: {
          ...(query.dateFrom ? { gte: query.dateFrom } : {}),
          ...(query.dateTo ? { lte: query.dateTo } : {}),
        },
      });
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : undefined;

    const [items, totalItems] = await prisma.$transaction([
      prisma.auditLog.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: {
          createdAt: query.sortDirection,
        },
        include: {
          actor: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      items: items.map((item) =>
        mapAuditLog({
          ...item,
          module: item.module,
        })
      ),
      totalItems,
    };
  }

  async getAuditLogById(auditLogId: string): Promise<AdminAuditLogDetailDTO | null> {
    const auditLog = await prisma.auditLog.findUnique({
      where: { id: auditLogId },
      include: {
        actor: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!auditLog) {
      return null;
    }

    return mapAuditLog({
      ...auditLog,
      module: auditLog.module,
    });
  }
}
