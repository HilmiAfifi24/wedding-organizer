import type { AdminUserDetailDTO, PaginatedResult } from "@wo/shared-types";

import type { UserListFilters } from "../types";

type ApiSuccess<T> = {
  success: true;
  data: T;
  message: string;
};

type ApiError = {
  success: false;
  message: string;
  details?: unknown;
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const body = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiError | null;

  if (!response.ok || !body || body.success === false) {
    throw new Error(body?.message || "Request failed");
  }

  return body.data;
};

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  return parseResponse<T>(response);
};

const buildUserListQuery = (params: {
  page: number;
  pageSize: number;
  filters: UserListFilters;
}) => {
  const query = new URLSearchParams();

  query.set("page", String(params.page));
  query.set("pageSize", String(params.pageSize));

  if (params.filters.search?.trim()) {
    query.set("search", params.filters.search.trim());
  }

  if (params.filters.role && params.filters.role !== "ALL") {
    query.set("role", params.filters.role);
  }

  if (params.filters.status && params.filters.status !== "ALL") {
    query.set("status", params.filters.status);
  }

  if (params.filters.sortBy) {
    query.set("sortBy", params.filters.sortBy);
  }

  if (params.filters.sortDirection) {
    query.set("sortDirection", params.filters.sortDirection);
  }

  if (params.filters.includeDeleted) {
    query.set("includeDeleted", "true");
  }

  return query.toString();
};

export const usersApi = {
  list: (params: { page: number; pageSize: number; filters: UserListFilters }) =>
    request<PaginatedResult<import("@wo/shared-types").AdminUserListItemDTO>>(
      `/api/admin/users?${buildUserListQuery(params)}`
    ),

  detail: (userId: string, options?: { includeHistory?: boolean; includeDeleted?: boolean }) => {
    const query = new URLSearchParams();
    if (options?.includeHistory !== undefined) {
      query.set("includeHistory", String(options.includeHistory));
    }
    if (options?.includeDeleted) {
      query.set("includeDeleted", "true");
    }

    const queryText = query.toString();
    return request<AdminUserDetailDTO>(
      `/api/admin/users/${userId}${queryText ? `?${queryText}` : ""}`
    );
  },

  suspend: (userId: string, reason?: string) =>
    request<AdminUserDetailDTO>(`/api/admin/users/${userId}/suspend`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),

  unsuspend: (userId: string, reason?: string) =>
    request<AdminUserDetailDTO>(`/api/admin/users/${userId}/unsuspend`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),

  softDelete: (userId: string) =>
    request<AdminUserDetailDTO>(`/api/admin/users/${userId}`, {
      method: "DELETE",
    }),
};
