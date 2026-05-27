import "server-only";

import type {
  CreateServiceInput,
  ListOptions,
  ServiceDTO,
  UpdateServiceInput,
} from "@wo/shared-types";

import type { ServiceRepository } from "../../../domain/repositories";
import { prisma } from "../prisma";

export class PrismaServiceRepository implements ServiceRepository {
  async findById(id: string): Promise<ServiceDTO | null> {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) return null;
    return service as unknown as ServiceDTO;
  }

  async listByVendor(vendorId: string, options?: ListOptions): Promise<ServiceDTO[]> {
    const services = await prisma.service.findMany({
      where: { vendorId },
      take: options?.take,
      skip: options?.skip,
      orderBy: { createdAt: "desc" },
    });
    return services as unknown as ServiceDTO[];
  }

  async create(data: CreateServiceInput): Promise<ServiceDTO> {
    const service = await prisma.service.create({ data });
    return service as unknown as ServiceDTO;
  }

  async update(id: string, data: UpdateServiceInput): Promise<ServiceDTO> {
    const service = await prisma.service.update({ where: { id }, data });
    return service as unknown as ServiceDTO;
  }

  async remove(id: string): Promise<void> {
    await prisma.service.delete({ where: { id } });
  }
}
