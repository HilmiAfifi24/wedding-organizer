import "server-only";

import type {
  CreatePortfolioInput,
  ListOptions,
  PortfolioDTO,
} from "@wo/shared-types";

import type { PortfolioRepository } from "../../domain/repositories";
import { prisma } from "../prisma";

export class PrismaPortfolioRepository implements PortfolioRepository {
  async listByVendor(vendorId: string, options?: ListOptions): Promise<PortfolioDTO[]> {
    return prisma.portfolio.findMany({
      where: { vendorId },
      take: options?.take,
      skip: options?.skip,
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: CreatePortfolioInput): Promise<PortfolioDTO> {
    return prisma.portfolio.create({ data });
  }

  async remove(id: string): Promise<void> {
    await prisma.portfolio.delete({ where: { id } });
  }
}
