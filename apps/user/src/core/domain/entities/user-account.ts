import { UserStatus } from "@wo/shared-types";

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
