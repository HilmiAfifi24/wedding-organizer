import type {
  AdminUserDetailDTO,
  AdminUserListItemDTO,
  AdminUsersQuery,
  PaginatedResult,
} from "@wo/shared-types";

export type UserListResponse = PaginatedResult<AdminUserListItemDTO>;

export type UserDetailResponse = AdminUserDetailDTO;

export interface ParsedUserListQuery extends Required<Pick<AdminUsersQuery, "page" | "pageSize" | "sortBy" | "sortDirection">>, Omit<AdminUsersQuery, "page" | "pageSize" | "sortBy" | "sortDirection"> {}
