import "server-only";

import bcrypt from "bcryptjs";

import type { PasswordHasher } from "@/core/domain/services/password-hasher";

export class BcryptPasswordHasher implements PasswordHasher {
  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
