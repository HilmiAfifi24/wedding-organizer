import "server-only";

import type { CreateUserInput, UserDTO } from "@wo/shared-types";

import type { UserRepository } from "../../domain/repositories";
import { prisma } from "../prisma";

export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<UserDTO | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserDTO | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: CreateUserInput): Promise<UserDTO> {
    return prisma.user.create({ data });
  }
}
