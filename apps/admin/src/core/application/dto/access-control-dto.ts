import type {
  AccessMenuDTO,
  AccessPermissionDTO,
  AccessProfileDTO,
  AccessUserDTO,
} from "@wo/shared-types";

export interface AccessMenuTreeNode extends AccessMenuDTO {
  permissions?: Omit<AccessPermissionDTO, "id" | "accessMenuId" | "accessProfileId" | "createdAt" | "updatedAt">;
  children: AccessMenuTreeNode[];
}

export interface AccessProfileWithPermissions {
  profile: AccessProfileDTO;
  permissions: AccessPermissionDTO[];
}

export interface AccessUsersResponse {
  users: AccessUserDTO[];
}
