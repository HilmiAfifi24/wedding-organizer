import { z } from "zod";

import type { AdminAuthRepository } from "@/core/domain/repositories";
import type { PasswordHasher } from "@/core/domain/services/password-hasher";

const authenticateAdminSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
});

export type AuthenticateAdminInput = z.infer<typeof authenticateAdminSchema>;

export type AuthenticatedAdmin = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN";
  accessProfileId: string | null;
};

export class AuthenticateAdminUseCase {
  constructor(
    private readonly adminAuthRepository: AdminAuthRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(input: AuthenticateAdminInput): Promise<AuthenticatedAdmin | null> {
    const parsed = authenticateAdminSchema.safeParse(input);
    if (!parsed.success) {
      return null;
    }

    const user = await this.adminAuthRepository.findByEmail(parsed.data.email);

    if (!user || !user.passwordHash) {
      return null;
    }

    if (user.role !== "ADMIN") {
      return null;
    }

    if (user.suspendedAt || user.deletedAt) {
      return null;
    }

    const isValid = await this.passwordHasher.compare(parsed.data.password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: "ADMIN",
      accessProfileId: user.accessProfileId,
    };
  }
}
