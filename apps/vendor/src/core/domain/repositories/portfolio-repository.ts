import type {
  CreatePortfolioInput,
  ListOptions,
  PortfolioDTO,
  UpdatePortfolioInput,
} from "@wo/shared-types";

export interface PortfolioRepository {
  findById(id: string): Promise<PortfolioDTO | null>;
  listByVendor(vendorId: string, options?: ListOptions): Promise<PortfolioDTO[]>;
  create(data: CreatePortfolioInput): Promise<PortfolioDTO>;
  update(id: string, data: UpdatePortfolioInput): Promise<PortfolioDTO>;
  remove(id: string): Promise<void>;
}
