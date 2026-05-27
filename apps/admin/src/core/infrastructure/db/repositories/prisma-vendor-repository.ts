import "server-only";

import type {
  CreateVendorInput,
  ListOptions,
  UpdateVendorInput,
  VendorDTO,
} from "@wo/shared-types";

import type { VendorRepository } from "@/core/domain/repositories";
import { prisma } from "../prisma";

export class PrismaVendorRepository implements VendorRepository {
  async findById(id: string): Promise<VendorDTO | null> {
    return prisma.vendor.findUnique({ where: { id } });
  }

  async list(options?: ListOptions & { categoryId?: string }): Promise<VendorDTO[]> {
    return prisma.vendor.findMany({
      where: options?.categoryId ? { categoryId: options.categoryId } : undefined,
      take: options?.take,
      skip: options?.skip,
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: CreateVendorInput): Promise<VendorDTO> {
    return prisma.vendor.create({ data });
  }

  async update(id: string, data: UpdateVendorInput): Promise<VendorDTO> {
    return prisma.vendor.update({ where: { id }, data });
  }
}
