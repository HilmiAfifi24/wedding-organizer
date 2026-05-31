import "server-only";

import type {
  CreatePortfolioInput,
  ListOptions,
  PortfolioDTO,
} from "@wo/shared-types";

import type { PortfolioRepository } from "../../../domain/repositories";
import { prisma } from "../prisma";

export class PrismaPortfolioRepository implements PortfolioRepository {
  async findById(id: string): Promise<PortfolioDTO | null> {
    const portfolio = await prisma.portfolio.findUnique({ where: { id } });
    if (!portfolio) return null;
    return portfolio as unknown as PortfolioDTO;
  }

  async listByVendor(vendorId: string, options?: ListOptions): Promise<PortfolioDTO[]> {
    const portfolios = await prisma.portfolio.findMany({
      where: { vendorId },
      take: options?.take,
      skip: options?.skip,
      orderBy: { createdAt: "desc" },
    });
    return portfolios as unknown as PortfolioDTO[];
  }

  async create(data: CreatePortfolioInput): Promise<PortfolioDTO> {
    const portfolio = await prisma.portfolio.create({
      data: {
        ...data,
        mediaType: data.mediaType as "IMAGE" | "VIDEO",
      },
    });
    return portfolio as unknown as PortfolioDTO;
  }

  async remove(id: string): Promise<void> {
    await prisma.portfolio.delete({ where: { id } });
  }
}
