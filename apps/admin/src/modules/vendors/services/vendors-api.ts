import type {
  AdminVendorDetailDTO,
  AdminVendorListItemDTO,
  PaginatedResult,
} from "@wo/shared-types";

import type { VendorListFilters } from "../types";

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

const buildVendorListQuery = (params: {
  page: number;
  pageSize: number;
  filters: VendorListFilters;
}) => {
  const query = new URLSearchParams();

  query.set("page", String(params.page));
  query.set("pageSize", String(params.pageSize));

  if (params.filters.search?.trim()) {
    query.set("search", params.filters.search.trim());
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

export const vendorsApi = {
  list: (params: { page: number; pageSize: number; filters: VendorListFilters }) =>
    request<PaginatedResult<AdminVendorListItemDTO>>(
      `/api/admin/vendors?${buildVendorListQuery(params)}`
    ),

  detail: (
    vendorId: string,
    options?: { includeHistory?: boolean; includeDeleted?: boolean }
  ) => {
    const query = new URLSearchParams();

    if (options?.includeHistory !== undefined) {
      query.set("includeHistory", String(options.includeHistory));
    }

    if (options?.includeDeleted) {
      query.set("includeDeleted", "true");
    }

    const queryText = query.toString();
    return request<AdminVendorDetailDTO>(
      `/api/admin/vendors/${vendorId}${queryText ? `?${queryText}` : ""}`
    );
  },

  approve: (vendorId: string) =>
    request<AdminVendorDetailDTO>(`/api/admin/vendors/${vendorId}/approve`, {
      method: "PATCH",
    }),

  reject: (vendorId: string, reason: string) =>
    request<AdminVendorDetailDTO>(`/api/admin/vendors/${vendorId}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),

  suspend: (vendorId: string) =>
    request<AdminVendorDetailDTO>(`/api/admin/vendors/${vendorId}/suspend`, {
      method: "PATCH",
    }),

  unsuspend: (vendorId: string) =>
    request<AdminVendorDetailDTO>(`/api/admin/vendors/${vendorId}/unsuspend`, {
      method: "PATCH",
    }),

  softDelete: (vendorId: string) =>
    request<AdminVendorDetailDTO>(`/api/admin/vendors/${vendorId}`, {
      method: "DELETE",
    }),
};
