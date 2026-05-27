import type {
  AccessMenuDTO,
  AccessPermissionDTO,
  AccessProfileDTO,
} from "@wo/shared-types";

export interface AccessPermissionFlags {
  canView: boolean;
  canInsert: boolean;
  canUpdate: boolean;
  canUpsert: boolean;
  canDelete: boolean;
  canHistory: boolean;
  customEvents: string[];
}

export interface AccessMenuNode extends AccessMenuDTO {
  permissions?: AccessPermissionFlags;
  children: AccessMenuNode[];
}

export interface AccessProfilePermissionMatrix {
  profile: AccessProfileDTO;
  permissions: AccessPermissionDTO[];
}
