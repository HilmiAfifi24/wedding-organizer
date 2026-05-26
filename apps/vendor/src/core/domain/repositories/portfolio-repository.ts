import type {
  CreatePortfolioInput,
  ListOptions,
  PortfolioDTO,
} from "@wo/shared-types";

export interface PortfolioRepository {
  listByVendor(vendorId: string, options?: ListOptions): Promise<PortfolioDTO[]>;
  create(data: CreatePortfolioInput): Promise<PortfolioDTO>;
  remove(id: string): Promise<void>;
}
