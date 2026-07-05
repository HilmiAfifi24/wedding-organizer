import {
  CreateAdminAdatUseCase,
  DeleteAdminAdatUseCase,
  ListAdminAdatsUseCase,
  UpdateAdminAdatUseCase,
} from "@/core/application/use-cases/adats";
import { PrismaAdatManagementRepository } from "@/core/infrastructure/db/repositories/prisma-adat-management-repository";

export const createAdatManagementUseCases = () => {
  const repository = new PrismaAdatManagementRepository();

  return {
    listAdminAdatsUseCase: new ListAdminAdatsUseCase(repository),
    createAdminAdatUseCase: new CreateAdminAdatUseCase(repository),
    updateAdminAdatUseCase: new UpdateAdminAdatUseCase(repository),
    deleteAdminAdatUseCase: new DeleteAdminAdatUseCase(repository),
  };
};
