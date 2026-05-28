import "server-only";

import type {
  AdminUserDetailDTO,
  AdminUserListItemDTO,
  AdminUsersQuery,
  AuditLogDTO,
  CreateAuditLogInput,
  Role,
  UserStatus,
} from "@wo/shared-types";

import { getUserStatus, type PermissionFlags } from "@/core/domain/entities/user-management";
import type { UserManagementRepository } from "@/core/domain/repositories";

import { prisma } from "../prisma";

type PrismaUserListRecord = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  accessProfileId: string | null;
  suspendedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  accessProfile: {
    code: string;
    name: string;
  } | null;
};

const mapRole = (role: string): Role => role as Role;

const mapStatus = (input: {
  deletedAt: Date | null;
  suspendedAt: Date | null;
}): UserStatus => getUserStatus(input) as UserStatus;

const mapUserListItem = (user: PrismaUserListRecord): AdminUserListItemDTO => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: mapRole(user.role),
  status: mapStatus(user),
  accessProfileId: user.accessProfileId,
  accessProfileCode: user.accessProfile?.code ?? null,
  accessProfileName: user.accessProfile?.name ?? null,
  suspendedAt: user.suspendedAt,
  deletedAt: user.deletedAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const toJsonValue = (value: unknown) => {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value));
};

export class PrismaUserManagementRepository implements UserManagementRepository {
  async getActorPermissionByMenuCode(
    actorId: string,
    menuCode: string
  ): Promise<PermissionFlags | null> {
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

  async listUsers(
    query: Required<Pick<AdminUsersQuery, "page" | "pageSize" | "sortBy" | "sortDirection">> &
      Omit<AdminUsersQuery, "page" | "pageSize" | "sortBy" | "sortDirection">
  ): Promise<{ items: AdminUserListItemDTO[]; totalItems: number }> {
    const skip = (query.page - 1) * query.pageSize;

    const where = {
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" as const } },
              { email: { contains: query.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(query.role ? { role: query.role } : {}),
      ...(query.status === "ACTIVE"
        ? { deletedAt: null, suspendedAt: null }
        : query.status === "SUSPENDED"
        ? { deletedAt: null, suspendedAt: { not: null } }
        : query.status === "DELETED"
        ? { deletedAt: { not: null } }
        : query.includeDeleted
        ? {}
        : { deletedAt: null }),
    };

    const orderBy = { [query.sortBy]: query.sortDirection } as Record<string, "asc" | "desc">;

    const [users, totalItems] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy,
        include: {
          accessProfile: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items: users.map((user) =>
        mapUserListItem({
          ...user,
          role: user.role,
        })
      ),
      totalItems,
    };
  }

  async getUserById(userId: string, includeDeleted = false): Promise<AdminUserDetailDTO | null> {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: {
        accessProfile: {
          select: {
            code: true,
            name: true,
          },
        },
        bookings: {
          orderBy: {
            bookedAt: "desc",
          },
          include: {
            vendor: {
              select: {
                name: true,
              },
            },
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    const listItem = mapUserListItem({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      accessProfileId: user.accessProfileId,
      suspendedAt: user.suspendedAt,
      deletedAt: user.deletedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      accessProfile: user.accessProfile,
    });

    return {
      ...listItem,
      bookings: user.bookings.map((booking) => ({
        id: booking.id,
        bookedAt: booking.bookedAt,
        status: booking.status as AdminUserDetailDTO["bookings"][number]["status"],
        notes: booking.notes,
        vendorId: booking.vendorId,
        vendorName: booking.vendor.name,
        serviceId: booking.serviceId,
        serviceName: booking.service?.name ?? null,
        createdAt: booking.createdAt,
      })),
    };
  }

  async suspendUser(userId: string, actorId: string): Promise<AdminUserDetailDTO> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        suspendedAt: new Date(),
        suspendedBy: actorId,
      },
    });

    const user = await this.getUserById(userId, true);
    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async unsuspendUser(userId: string): Promise<AdminUserDetailDTO> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        suspendedAt: null,
        suspendedBy: null,
      },
    });

    const user = await this.getUserById(userId, true);
    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async softDeleteUser(userId: string, actorId: string): Promise<AdminUserDetailDTO> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        deletedBy: actorId,
      },
    });

    const user = await this.getUserById(userId, true);
    if (!user) {
      throw new Error("User not found");
    }

    return user;
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
