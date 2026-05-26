import "server-only";

import type {
  CreateServiceInput,
  ListOptions,
  ServiceDTO,
  UpdateServiceInput,
} from "@wo/shared-types";

import type { ServiceRepository } from "../../domain/repositories";
import { prisma } from "../prisma";

export class PrismaServiceRepository implements ServiceRepository {
  async findById(id: string): Promise<ServiceDTO | null> {
    return prisma.service.findUnique({ where: { id } });
  }

  async listByVendor(vendorId: string, options?: ListOptions): Promise<ServiceDTO[]> {
    return prisma.service.findMany({
      where: { vendorId },
      take: options?.take,
      skip: options?.skip,
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: CreateServiceInput): Promise<ServiceDTO> {
    return prisma.service.create({ data });
  }

  async update(id: string, data: UpdateServiceInput): Promise<ServiceDTO> {
    return prisma.service.update({ where: { id }, data });
  }

  async remove(id: string): Promise<void> {
    await prisma.service.delete({ where: { id } });
  }
}
