import "server-only";

import type { CreateUserInput, Role, UserDTO } from "@wo/shared-types";

import type { UserRepository } from "@/core/domain/repositories";
import { prisma } from "../prisma";

const mapUser = (user: Omit<UserDTO, "role"> & { role: string }): UserDTO => ({
  ...user,
  role: user.role as Role,
});

export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<UserDTO | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? mapUser(user) : null;
  }

  async findByEmail(email: string): Promise<UserDTO | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? mapUser(user) : null;
  }

  async create(data: CreateUserInput): Promise<UserDTO> {
    const user = await prisma.user.create({ data });
    return mapUser(user);
  }
}
