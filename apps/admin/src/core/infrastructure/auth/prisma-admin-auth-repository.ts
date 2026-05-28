import "server-only";

import type { AdminAuthRepository, AdminAuthUser } from "@/core/domain/repositories";
import { prisma } from "../db/prisma";

export class PrismaAdminAuthRepository implements AdminAuthRepository {
  async findByEmail(email: string): Promise<AdminAuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        role: true,
        accessProfileId: true,
        suspendedAt: true,
        deletedAt: true,
      },
    });

    return user
      ? {
          ...user,
          role: user.role as AdminAuthUser["role"],
        }
      : null;
  }
}
