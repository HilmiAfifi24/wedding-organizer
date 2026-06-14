import {
  GetPublicVendorDetailUseCase,
  ListPublicVendorPortfolioUseCase,
  ListPublicVendorReviewsUseCase,
  ListPublicVendorServicesUseCase,
  ListPublicVendorsUseCase,
} from "@/core/application/use-cases/public-vendor-use-cases";
import { PrismaPublicVendorRepository } from "@/core/infrastructure/db/repositories";

export const createPublicVendorUseCases = () => {
  const repository = new PrismaPublicVendorRepository();

  return {
    repository,
    listPublicVendorsUseCase: new ListPublicVendorsUseCase(repository),
    getPublicVendorDetailUseCase: new GetPublicVendorDetailUseCase(repository),
    listPublicVendorServicesUseCase: new ListPublicVendorServicesUseCase(repository),
    listPublicVendorPortfolioUseCase: new ListPublicVendorPortfolioUseCase(repository),
    listPublicVendorReviewsUseCase: new ListPublicVendorReviewsUseCase(repository),
  };
};
