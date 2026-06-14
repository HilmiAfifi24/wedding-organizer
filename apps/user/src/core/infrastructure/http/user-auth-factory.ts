import {
  AuthenticateUserUseCase,
  GetUserSessionUseCase,
  RegisterUserUseCase,
} from "@/core/application/use-cases/user-auth-use-cases";
import { PrismaUserAuthRepository } from "@/core/infrastructure/db/repositories";

export const createUserAuthUseCases = () => {
  const repository = new PrismaUserAuthRepository();

  return {
    repository,
    registerUserUseCase: new RegisterUserUseCase(repository),
    authenticateUserUseCase: new AuthenticateUserUseCase(repository),
    getUserSessionUseCase: new GetUserSessionUseCase(repository),
  };
};
