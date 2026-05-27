import "server-only";

import type { CreateUserInput, UserDTO } from "@wo/shared-types";

import type { UserRepository } from "../../../domain/repositories";
import { prisma } from "../prisma";

export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<UserDTO | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return user as unknown as UserDTO;
  }

  async findByEmail(email: string): Promise<UserDTO | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return user as unknown as UserDTO;
  }

  async create(data: CreateUserInput): Promise<UserDTO> {
    const user = await prisma.user.create({
      data: {
        ...data,
        role: data.role as any,
      }
    });
    return user as unknown as UserDTO;
  }
}
