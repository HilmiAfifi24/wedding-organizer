import type {
  AccessMenuDTO,
  AccessPermissionDTO,
  AccessProfileDTO,
  AccessUserDTO,
  SetAccessPermissionInput,
} from "@wo/shared-types";

export type AccessMenuTreeNode = AccessMenuDTO & {
  permissions?: {
    canView: boolean;
    canInsert: boolean;
    canUpdate: boolean;
    canUpsert: boolean;
    canDelete: boolean;
    canHistory: boolean;
    customEvents: string[];
  };
  children: AccessMenuTreeNode[];
};

export type AccessProfilePermissionsResponse = {
  profile: AccessProfileDTO;
  permissions: AccessPermissionDTO[];
};

export type AccessUserWithMenusResponse = {
  user: AccessUserDTO;
  menuTree: AccessMenuTreeNode[];
};

export type PermissionMatrixState = Record<string, SetAccessPermissionInput>;
