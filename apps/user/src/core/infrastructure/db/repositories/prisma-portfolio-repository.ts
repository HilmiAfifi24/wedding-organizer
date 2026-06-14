import "server-only";

import type {
  CreatePortfolioInput,
  ListOptions,
  MediaType,
  PortfolioDTO,
} from "@wo/shared-types";

import type { PortfolioRepository } from "../../../domain/repositories";
import { prisma } from "../prisma";

const mapPortfolio = (
  portfolio:
    | {
        id: string;
        vendorId: string;
        title: string | null;
        description: string | null;
        mediaUrl: string;
        mediaType: string;
        createdAt: Date;
        updatedAt: Date;
      }
    | null
): PortfolioDTO | null => {
  if (!portfolio) {
    return null;
  }

  return {
    ...portfolio,
    mediaType: portfolio.mediaType as MediaType,
  };
};

export class PrismaPortfolioRepository implements PortfolioRepository {
  async listByVendor(vendorId: string, options?: ListOptions): Promise<PortfolioDTO[]> {
    const portfolio = await prisma.portfolio.findMany({
      where: { vendorId },
      take: options?.take,
      skip: options?.skip,
      orderBy: { createdAt: "desc" },
    });

    return portfolio.map((item) => mapPortfolio(item) as PortfolioDTO);
  }

  async create(data: CreatePortfolioInput): Promise<PortfolioDTO> {
    const portfolio = await prisma.portfolio.create({ data });
    return mapPortfolio(portfolio) as PortfolioDTO;
  }

  async remove(id: string): Promise<void> {
    await prisma.portfolio.delete({ where: { id } });
  }
}
