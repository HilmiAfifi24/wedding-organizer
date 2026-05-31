import {
  CreateAdminCategoryUseCase,
  DeleteAdminCategoryUseCase,
  ListAdminCategoriesUseCase,
  UpdateAdminCategoryUseCase,
} from "@/core/application/use-cases/categories";
import { PrismaCategoryManagementRepository } from "@/core/infrastructure/db/repositories/prisma-category-management-repository";

export const createCategoryManagementUseCases = () => {
  const repository = new PrismaCategoryManagementRepository();

  return {
    listAdminCategoriesUseCase: new ListAdminCategoriesUseCase(repository),
    createAdminCategoryUseCase: new CreateAdminCategoryUseCase(repository),
    updateAdminCategoryUseCase: new UpdateAdminCategoryUseCase(repository),
    deleteAdminCategoryUseCase: new DeleteAdminCategoryUseCase(repository),
  };
};
