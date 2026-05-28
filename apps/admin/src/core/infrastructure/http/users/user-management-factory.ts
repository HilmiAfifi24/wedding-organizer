import {
  GetAdminUserDetailUseCase,
  ListAdminUsersUseCase,
  SoftDeleteAdminUserUseCase,
  SuspendAdminUserUseCase,
  UnsuspendAdminUserUseCase,
} from "@/core/application/use-cases/users";
import { PrismaUserManagementRepository } from "@/core/infrastructure/db/repositories";

export const createUserManagementUseCases = () => {
  const repository = new PrismaUserManagementRepository();

  return {
    listAdminUsersUseCase: new ListAdminUsersUseCase(repository),
    getAdminUserDetailUseCase: new GetAdminUserDetailUseCase(repository),
    suspendAdminUserUseCase: new SuspendAdminUserUseCase(repository),
    unsuspendAdminUserUseCase: new UnsuspendAdminUserUseCase(repository),
    softDeleteAdminUserUseCase: new SoftDeleteAdminUserUseCase(repository),
  };
};
