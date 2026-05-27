import type {
  AccessPermissionDTO,
  AccessProfileDTO,
  CreateAccessProfileInput,
  SetAccessPermissionInput,
  UpdateAccessProfileInput,
} from "@wo/shared-types";

export interface AccessProfileRepository {
  findById(id: string): Promise<AccessProfileDTO | null>;
  listAll(): Promise<AccessProfileDTO[]>;
  create(data: CreateAccessProfileInput): Promise<AccessProfileDTO>;
  update(id: string, data: UpdateAccessProfileInput): Promise<AccessProfileDTO>;
  remove(id: string): Promise<void>;

  listPermissions(accessProfileId: string): Promise<AccessPermissionDTO[]>;
  setPermissions(
    accessProfileId: string,
    permissions: SetAccessPermissionInput[]
  ): Promise<AccessPermissionDTO[]>;
}
