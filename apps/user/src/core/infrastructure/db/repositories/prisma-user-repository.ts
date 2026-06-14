import "server-only";

import { type CreateUserInput, type Role, type UserDTO } from "@wo/shared-types";

import type { UserRepository } from "../../../domain/repositories";
import { prisma } from "../prisma";

const mapUser = (
  user:
    | {
        id: string;
        email: string;
        phoneNumber: string | null;
        name: string | null;
        passwordHash: string | null;
        role: string;
        accessProfileId: string | null;
        deletedAt: Date | null;
        deletedBy: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
      }
    | null
): UserDTO | null => {
  if (!user) {
    return null;
  }

  return {
    ...user,
    role: user.role as Role,
  };
};

export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<UserDTO | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return mapUser(user);
  }

  async findByEmail(email: string): Promise<UserDTO | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return mapUser(user);
  }

  async findByPhoneNumber(phoneNumber: string): Promise<UserDTO | null> {
    const user = await prisma.user.findUnique({ where: { phoneNumber } });
    return mapUser(user);
  }

  async create(data: CreateUserInput): Promise<UserDTO> {
    const user = await prisma.user.create({ data });
    return mapUser(user) as UserDTO;
  }
}
