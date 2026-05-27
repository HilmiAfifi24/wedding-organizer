import "server-only";

import type {
  CreatePortfolioInput,
  ListOptions,
  MediaType,
  PortfolioDTO,
} from "@wo/shared-types";

import type { PortfolioRepository } from "@/core/domain/repositories";
import { prisma } from "../prisma";

const mapPortfolio = (
  portfolio: Omit<PortfolioDTO, "mediaType"> & { mediaType: string }
): PortfolioDTO => ({
  ...portfolio,
  mediaType: portfolio.mediaType as MediaType,
});

export class PrismaPortfolioRepository implements PortfolioRepository {
  async listByVendor(vendorId: string, options?: ListOptions): Promise<PortfolioDTO[]> {
    const portfolios = await prisma.portfolio.findMany({
      where: { vendorId },
      take: options?.take,
      skip: options?.skip,
      orderBy: { createdAt: "desc" },
    });

    return portfolios.map(mapPortfolio);
  }

  async create(data: CreatePortfolioInput): Promise<PortfolioDTO> {
    const portfolio = await prisma.portfolio.create({ data });
    return mapPortfolio(portfolio);
  }

  async remove(id: string): Promise<void> {
    await prisma.portfolio.delete({ where: { id } });
  }
}
