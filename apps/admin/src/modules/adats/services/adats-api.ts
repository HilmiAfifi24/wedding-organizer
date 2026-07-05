import type {
  AdminAdatListItemDTO,
  PaginatedResult,
} from "@wo/shared-types";

import type { AdatListFilters } from "../types";

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

const buildAdatListQuery = (params: {
  page: number;
  pageSize: number;
  filters: AdatListFilters;
}) => {
  const query = new URLSearchParams();

  query.set("page", String(params.page));
  query.set("pageSize", String(params.pageSize));

  if (params.filters.search?.trim()) {
    query.set("search", params.filters.search.trim());
  }

  if (params.filters.sortBy) {
    query.set("sortBy", params.filters.sortBy);
  }

  if (params.filters.sortDirection) {
    query.set("sortDirection", params.filters.sortDirection);
  }

  return query.toString();
};

export const adatsApi = {
  list: (params: { page: number; pageSize: number; filters: AdatListFilters }) =>
    request<PaginatedResult<AdminAdatListItemDTO>>(
      `/api/admin/adats?${buildAdatListQuery(params)}`
    ),

  create: (data: { name: string }) =>
    request<AdminAdatListItemDTO>("/api/admin/adats", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (adatId: string, data: { name: string }) =>
    request<AdminAdatListItemDTO>(`/api/admin/adats/${adatId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  remove: (adatId: string) =>
    request<AdminAdatListItemDTO>(`/api/admin/adats/${adatId}`, {
      method: "DELETE",
    }),
};
