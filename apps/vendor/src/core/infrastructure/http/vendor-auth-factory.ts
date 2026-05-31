import {
  AuthenticateVendorUseCase,
  GetVendorOnboardingUseCase,
  GetVendorSessionUseCase,
  ListVendorCategoriesUseCase,
  RegisterVendorUseCase,
  UpdateVendorOnboardingUseCase,
} from "@/core/application/use-cases/vendor-auth-use-cases";
import { PrismaVendorAuthRepository } from "@/core/infrastructure/db/repositories/prisma-vendor-auth-repository";

export const createVendorAuthUseCases = () => {
  const repository = new PrismaVendorAuthRepository();

  return {
    listVendorCategoriesUseCase: new ListVendorCategoriesUseCase(repository),
    registerVendorUseCase: new RegisterVendorUseCase(repository),
    authenticateVendorUseCase: new AuthenticateVendorUseCase(repository),
    getVendorSessionUseCase: new GetVendorSessionUseCase(repository),
    getVendorOnboardingUseCase: new GetVendorOnboardingUseCase(repository),
    updateVendorOnboardingUseCase: new UpdateVendorOnboardingUseCase(repository),
  };
};
