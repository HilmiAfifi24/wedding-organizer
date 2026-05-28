import type {
  AdminUserDetailDTO,
  AdminUserListItemDTO,
  PaginatedResult,
  Role,
  UserStatus,
} from "@wo/shared-types";

export type UserListResult = PaginatedResult<AdminUserListItemDTO>;

export interface UserListFilters {
  search?: string;
  role?: Role | "ALL";
  status?: UserStatus | "ALL";
  sortBy?: "createdAt" | "updatedAt" | "name" | "email";
  sortDirection?: "asc" | "desc";
  includeDeleted?: boolean;
}

export type UserDetailResult = AdminUserDetailDTO;
