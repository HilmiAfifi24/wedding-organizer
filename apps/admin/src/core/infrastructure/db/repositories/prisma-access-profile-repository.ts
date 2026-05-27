import "server-only";

import type {
  AccessPermissionDTO,
  AccessProfileDTO,
  CreateAccessProfileInput,
  SetAccessPermissionInput,
  UpdateAccessProfileInput,
} from "@wo/shared-types";

import type { AccessProfileRepository } from "@/core/domain/repositories";
import { prisma } from "../prisma";

const mapCustomEvents = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
};

export class PrismaAccessProfileRepository implements AccessProfileRepository {
  async findById(id: string): Promise<AccessProfileDTO | null> {
    return prisma.accessProfile.findUnique({ where: { id } });
  }

  async listAll(): Promise<AccessProfileDTO[]> {
    return prisma.accessProfile.findMany({ orderBy: [{ isSystem: "desc" }, { name: "asc" }] });
  }

  async create(data: CreateAccessProfileInput): Promise<AccessProfileDTO> {
    return prisma.accessProfile.create({ data });
  }

  async update(id: string, data: UpdateAccessProfileInput): Promise<AccessProfileDTO> {
    return prisma.accessProfile.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<void> {
    await prisma.accessProfile.delete({ where: { id } });
  }

  async listPermissions(accessProfileId: string): Promise<AccessPermissionDTO[]> {
    const permissions = await prisma.accessPermission.findMany({
      where: { accessProfileId },
      orderBy: { createdAt: "asc" },
    });

    return permissions.map((permission) => ({
      ...permission,
      customEvents: mapCustomEvents(permission.customEvents),
    }));
  }

  async setPermissions(
    accessProfileId: string,
    permissions: SetAccessPermissionInput[]
  ): Promise<AccessPermissionDTO[]> {
    await prisma.$transaction(async (tx) => {
      await tx.accessPermission.deleteMany({ where: { accessProfileId } });

      if (permissions.length > 0) {
        await tx.accessPermission.createMany({
          data: permissions.map((permission) => ({
            accessProfileId,
            accessMenuId: permission.accessMenuId,
            canView: permission.canView ?? false,
            canInsert: permission.canInsert ?? false,
            canUpdate: permission.canUpdate ?? false,
            canUpsert: permission.canUpsert ?? false,
            canDelete: permission.canDelete ?? false,
            canHistory: permission.canHistory ?? false,
            customEvents: permission.customEvents ?? [],
          })),
        });
      }
    });

    return this.listPermissions(accessProfileId);
  }
}
