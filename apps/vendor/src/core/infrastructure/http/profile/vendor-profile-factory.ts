import {
  GetVendorChecklistUseCase,
  GetVendorProfileUseCase,
  ListVendorProfileCategoriesUseCase,
  ResubmitVendorProfileUseCase,
  UpdateVendorCoverUseCase,
  UpdateVendorLogoUseCase,
  UpdateVendorProfileUseCase,
} from "@/core/application/use-cases/profile/vendor-profile-use-cases";
import { PrismaVendorProfileRepository } from "@/core/infrastructure/db/repositories";
import { DataUrlFileStorageService } from "@/core/infrastructure/storage/data-url-file-storage-service";

export const createVendorProfileUseCases = () => {
  const repository = new PrismaVendorProfileRepository();
  const storageService = new DataUrlFileStorageService();

  return {
    getVendorProfileUseCase: new GetVendorProfileUseCase(repository),
    getVendorChecklistUseCase: new GetVendorChecklistUseCase(repository),
    listVendorProfileCategoriesUseCase: new ListVendorProfileCategoriesUseCase(repository),
    updateVendorProfileUseCase: new UpdateVendorProfileUseCase(repository),
    updateVendorLogoUseCase: new UpdateVendorLogoUseCase(repository, storageService),
    updateVendorCoverUseCase: new UpdateVendorCoverUseCase(repository, storageService),
    resubmitVendorProfileUseCase: new ResubmitVendorProfileUseCase(repository),
  };
};
