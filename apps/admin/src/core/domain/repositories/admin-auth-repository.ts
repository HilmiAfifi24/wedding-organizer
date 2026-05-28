import type { Role } from "@wo/shared-types";

export interface AdminAuthUser {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string | null;
  role: Role;
  accessProfileId: string | null;
  suspendedAt: Date | null;
  deletedAt: Date | null;
}

export interface AdminAuthRepository {
  findByEmail(email: string): Promise<AdminAuthUser | null>;
}
