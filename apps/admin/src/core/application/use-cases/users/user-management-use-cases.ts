import { AuditModule } from "@wo/shared-types";
import type { AdminUsersQuery, CreateAuditLogInput } from "@wo/shared-types";

import {
  USER_MANAGEMENT_MENU_CODE,
  type PermissionFlags,
} from "@/core/domain/entities/user-management";
import type { UserManagementRepository } from "@/core/domain/repositories";

import type {
  ParsedUserListQuery,
  UserDetailResponse,
  UserListResponse,
} from "../../dto/users/user-management-dto";

const assertPermission = (
  permission: PermissionFlags | null,
  key: keyof PermissionFlags,
  message: string
) => {
  if (!permission || !permission[key]) {
    throw new Error(message);
  }
};

const defaultSortBy: NonNullable<AdminUsersQuery["sortBy"]> = "createdAt";
const defaultSortDirection: NonNullable<AdminUsersQuery["sortDirection"]> = "desc";

const toPagedResult = (
  query: Pick<ParsedUserListQuery, "page" | "pageSize">,
  totalItems: number,
  items: UserListResponse["items"]
): UserListResponse => ({
  items,
  page: query.page,
  pageSize: query.pageSize,
  totalItems,
  totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
});

export class ListAdminUsersUseCase {
  constructor(private readonly repository: UserManagementRepository) {}

  async execute(actorId: string, query: ParsedUserListQuery): Promise<UserListResponse> {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      USER_MANAGEMENT_MENU_CODE
    );

    assertPermission(permission, "canView", "Forbidden: no permission to view users");

    const normalizedQuery: ParsedUserListQuery = {
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
      role: query.role,
      status: query.status,
      includeDeleted: permission?.canHistory ? query.includeDeleted : false,
      sortBy: query.sortBy ?? defaultSortBy,
      sortDirection: query.sortDirection ?? defaultSortDirection,
    };

    const result = await this.repository.listUsers(normalizedQuery);
    return toPagedResult(normalizedQuery, result.totalItems, result.items);
  }
}

export class GetAdminUserDetailUseCase {
  constructor(private readonly repository: UserManagementRepository) {}

  async execute(
    actorId: string,
    userId: string,
    options?: { includeHistory?: boolean; includeDeleted?: boolean }
  ): Promise<UserDetailResponse> {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      USER_MANAGEMENT_MENU_CODE
    );

    assertPermission(permission, "canView", "Forbidden: no permission to view users");

    const includeHistory = options?.includeHistory ?? true;
    const includeDeleted = permission?.canHistory ? options?.includeDeleted ?? false : false;

    if (includeHistory) {
      assertPermission(permission, "canHistory", "Forbidden: no permission to view history");
    }

    const user = await this.repository.getUserById(userId, includeDeleted);
    if (!user) {
      throw new Error("User not found");
    }

    if (!includeHistory) {
      return {
        ...user,
        bookings: [],
      };
    }

    return user;
  }
}

const createAuditPayload = (
  actorId: string,
  action: string,
  targetId: string,
  beforeData: unknown,
  afterData: unknown
): CreateAuditLogInput => ({
  actorId,
  module: AuditModule.USER_MANAGEMENT,
  action,
  targetId,
  beforeData,
  afterData,
});

export class SuspendAdminUserUseCase {
  constructor(private readonly repository: UserManagementRepository) {}

  async execute(actorId: string, targetUserId: string) {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      USER_MANAGEMENT_MENU_CODE
    );

    assertPermission(permission, "canUpdate", "Forbidden: no permission to suspend user");

    if (actorId === targetUserId) {
      throw new Error("Admin cannot suspend themselves");
    }

    const before = await this.repository.getUserById(targetUserId, true);
    if (!before) {
      throw new Error("User not found");
    }

    if (before.deletedAt) {
      throw new Error("Cannot suspend deleted user");
    }

    const after = await this.repository.suspendUser(targetUserId, actorId);

    await this.repository.createAuditLog(
      createAuditPayload(actorId, "SUSPEND_USER", targetUserId, before, after)
    );

    return after;
  }
}

export class UnsuspendAdminUserUseCase {
  constructor(private readonly repository: UserManagementRepository) {}

  async execute(actorId: string, targetUserId: string) {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      USER_MANAGEMENT_MENU_CODE
    );

    assertPermission(permission, "canUpdate", "Forbidden: no permission to unsuspend user");

    const before = await this.repository.getUserById(targetUserId, true);
    if (!before) {
      throw new Error("User not found");
    }

    if (before.deletedAt) {
      throw new Error("Cannot unsuspend deleted user");
    }

    const after = await this.repository.unsuspendUser(targetUserId);

    await this.repository.createAuditLog(
      createAuditPayload(actorId, "UNSUSPEND_USER", targetUserId, before, after)
    );

    return after;
  }
}

export class SoftDeleteAdminUserUseCase {
  constructor(private readonly repository: UserManagementRepository) {}

  async execute(actorId: string, targetUserId: string) {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      USER_MANAGEMENT_MENU_CODE
    );

    assertPermission(permission, "canDelete", "Forbidden: no permission to delete user");

    if (actorId === targetUserId) {
      throw new Error("Admin cannot delete themselves");
    }

    const before = await this.repository.getUserById(targetUserId, true);
    if (!before) {
      throw new Error("User not found");
    }

    if (before.deletedAt) {
      throw new Error("User already deleted");
    }

    const after = await this.repository.softDeleteUser(targetUserId, actorId);

    await this.repository.createAuditLog(
      createAuditPayload(actorId, "DELETE_USER", targetUserId, before, after)
    );

    return after;
  }
}
