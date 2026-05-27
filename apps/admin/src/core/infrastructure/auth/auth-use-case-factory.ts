import { AuthenticateAdminUseCase } from "@/core/application/use-cases/auth/authenticate-admin-use-case";
import { BcryptPasswordHasher } from "@/core/infrastructure/security/bcrypt-password-hasher";

import { PrismaAdminAuthRepository } from "./prisma-admin-auth-repository";

export const createAuthUseCases = () => {
  const adminAuthRepository = new PrismaAdminAuthRepository();
  const passwordHasher = new BcryptPasswordHasher();

  return {
    authenticateAdminUseCase: new AuthenticateAdminUseCase(
      adminAuthRepository,
      passwordHasher
    ),
  };
};
