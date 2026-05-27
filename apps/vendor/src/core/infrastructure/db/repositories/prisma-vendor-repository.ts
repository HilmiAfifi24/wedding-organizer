import "server-only";

import type {
  CreateVendorInput,
  ListOptions,
  UpdateVendorInput,
  VendorDTO,
} from "@wo/shared-types";

import type { VendorRepository } from "../../../domain/repositories";
import { prisma } from "../prisma";

export class PrismaVendorRepository implements VendorRepository {
  async findById(id: string): Promise<VendorDTO | null> {
    const vendor = await prisma.vendor.findUnique({ where: { id } });
    if (!vendor) return null;
    return vendor as unknown as VendorDTO;
  }

  async list(options?: ListOptions & { categoryId?: string }): Promise<VendorDTO[]> {
    const vendors = await prisma.vendor.findMany({
      where: options?.categoryId ? { categoryId: options.categoryId } : undefined,
      take: options?.take,
      skip: options?.skip,
      orderBy: { createdAt: "desc" },
    });
    return vendors as unknown as VendorDTO[];
  }

  async create(data: CreateVendorInput): Promise<VendorDTO> {
    const vendor = await prisma.vendor.create({ data });
    return vendor as unknown as VendorDTO;
  }

  async update(id: string, data: UpdateVendorInput): Promise<VendorDTO> {
    const vendor = await prisma.vendor.update({ where: { id }, data });
    return vendor as unknown as VendorDTO;
  }
}
