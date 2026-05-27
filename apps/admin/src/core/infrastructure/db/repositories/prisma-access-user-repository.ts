import "server-only";

import type { AccessUserDTO } from "@wo/shared-types";

import type { AccessUserRepository } from "@/core/domain/repositories";
import { prisma } from "../prisma";

const mapAccessUser = (user: {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "VENDOR" | "ADMIN";
  accessProfileId: string | null;
  createdAt: Date;
  updatedAt: Date;
  accessProfile: {
    code: string;
    name: string;
  } | null;
}): AccessUserDTO => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role as AccessUserDTO["role"],
  accessProfileId: user.accessProfileId,
  accessProfileCode: user.accessProfile?.code ?? null,
  accessProfileName: user.accessProfile?.name ?? null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export class PrismaAccessUserRepository implements AccessUserRepository {
  async findById(userId: string): Promise<AccessUserDTO | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accessProfile: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    });

    return user ? mapAccessUser(user) : null;
  }

  async listUsers(search?: string): Promise<AccessUserDTO[]> {
    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: {
        accessProfile: {
          select: {
            code: true,
            name: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    return users.map(mapAccessUser);
  }

  async assignAccessProfile(userId: string, accessProfileId: string | null): Promise<AccessUserDTO> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { accessProfileId },
      include: {
        accessProfile: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    });

    return mapAccessUser(user);
  }
}
