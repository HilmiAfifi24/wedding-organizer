import type {
  AdminUserDetailDTO,
  AdminUserListItemDTO,
  AdminUsersQuery,
  AuditLogDTO,
  CreateAuditLogInput,
} from "@wo/shared-types";

import type { PermissionFlags } from "@/core/domain/entities/user-management";

export interface UserManagementRepository {
  getActorPermissionByMenuCode(actorId: string, menuCode: string): Promise<PermissionFlags | null>;

  listUsers(query: Required<Pick<AdminUsersQuery, "page" | "pageSize" | "sortBy" | "sortDirection">> & Omit<AdminUsersQuery, "page" | "pageSize" | "sortBy" | "sortDirection">): Promise<{ items: AdminUserListItemDTO[]; totalItems: number }>;
  getUserById(userId: string, includeDeleted?: boolean): Promise<AdminUserDetailDTO | null>;
  suspendUser(userId: string, actorId: string): Promise<AdminUserDetailDTO>;
  unsuspendUser(userId: string): Promise<AdminUserDetailDTO>;
  softDeleteUser(userId: string, actorId: string): Promise<AdminUserDetailDTO>;

  createAuditLog(data: CreateAuditLogInput): Promise<AuditLogDTO>;
}
