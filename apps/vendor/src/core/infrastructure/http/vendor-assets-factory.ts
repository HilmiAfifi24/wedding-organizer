import {
  CreateVendorPortfolioUseCase,
  CreateVendorServiceUseCase,
  DeleteVendorPortfolioUseCase,
  DeleteVendorServiceUseCase,
  ListVendorPortfolioUseCase,
  ListVendorServicesUseCase,
  UpdateVendorPortfolioUseCase,
  UpdateVendorServiceUseCase,
} from "@/core/application/use-cases/vendor-assets-use-cases";
import {
  PrismaPortfolioRepository,
  PrismaServiceRepository,
} from "@/core/infrastructure/db/repositories";

export const createVendorAssetsUseCases = () => {
  const serviceRepository = new PrismaServiceRepository();
  const portfolioRepository = new PrismaPortfolioRepository();

  return {
    listVendorServicesUseCase: new ListVendorServicesUseCase(serviceRepository),
    createVendorServiceUseCase: new CreateVendorServiceUseCase(serviceRepository),
    updateVendorServiceUseCase: new UpdateVendorServiceUseCase(serviceRepository),
    deleteVendorServiceUseCase: new DeleteVendorServiceUseCase(serviceRepository),
    listVendorPortfolioUseCase: new ListVendorPortfolioUseCase(portfolioRepository),
    createVendorPortfolioUseCase: new CreateVendorPortfolioUseCase(portfolioRepository),
    updateVendorPortfolioUseCase: new UpdateVendorPortfolioUseCase(portfolioRepository),
    deleteVendorPortfolioUseCase: new DeleteVendorPortfolioUseCase(portfolioRepository),
  };
};
