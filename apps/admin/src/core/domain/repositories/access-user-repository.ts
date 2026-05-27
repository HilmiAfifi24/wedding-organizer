import type { AccessUserDTO } from "@wo/shared-types";

export interface AccessUserRepository {
  findById(userId: string): Promise<AccessUserDTO | null>;
  listUsers(search?: string): Promise<AccessUserDTO[]>;
  assignAccessProfile(userId: string, accessProfileId: string | null): Promise<AccessUserDTO>;
}
