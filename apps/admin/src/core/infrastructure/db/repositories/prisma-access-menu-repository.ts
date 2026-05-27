import "server-only";

import type {
  AccessMenuDTO,
  CreateAccessMenuInput,
  UpdateAccessMenuInput,
} from "@wo/shared-types";

import type { AccessMenuRepository } from "@/core/domain/repositories";
import { prisma } from "../prisma";

export class PrismaAccessMenuRepository implements AccessMenuRepository {
  async findById(id: string): Promise<AccessMenuDTO | null> {
    return prisma.accessMenu.findUnique({ where: { id } });
  }

  async listAll(): Promise<AccessMenuDTO[]> {
    return prisma.accessMenu.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }

  async create(data: CreateAccessMenuInput): Promise<AccessMenuDTO> {
    return prisma.accessMenu.create({ data });
  }

  async update(id: string, data: UpdateAccessMenuInput): Promise<AccessMenuDTO> {
    return prisma.accessMenu.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<void> {
    await prisma.accessMenu.delete({ where: { id } });
  }
}
