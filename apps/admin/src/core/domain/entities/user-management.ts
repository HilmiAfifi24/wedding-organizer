import { UserStatus } from "@wo/shared-types";

export interface PermissionFlags {
  canView: boolean;
  canInsert: boolean;
  canUpdate: boolean;
  canUpsert: boolean;
  canDelete: boolean;
  canHistory: boolean;
}

export const USER_MANAGEMENT_MENU_CODE = "USER_MANAGEMENT";

export const getUserStatus = (input: {
  deletedAt?: Date | null;
  suspendedAt?: Date | null;
}): UserStatus => {
  if (input.deletedAt) {
    return UserStatus.DELETED;
  }

  if (input.suspendedAt) {
    return UserStatus.SUSPENDED;
  }

  return UserStatus.ACTIVE;
};
