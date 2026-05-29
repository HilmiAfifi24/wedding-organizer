import type {
  AdminReviewDetailDTO,
  AdminReviewListItemDTO,
  PaginatedResult,
  ReviewModerationHistoryDTO,
} from "@wo/shared-types";

import type { ReviewListFilters } from "../types";

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

const buildReviewListQuery = (params: {
  page: number;
  pageSize: number;
  filters: ReviewListFilters;
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

  if (typeof params.filters.rating === "number") {
    query.set("rating", String(params.filters.rating));
  }

  if (params.filters.vendor?.trim()) {
    query.set("vendor", params.filters.vendor.trim());
  }

  if (params.filters.createdFrom) {
    query.set("createdFrom", params.filters.createdFrom);
  }

  if (params.filters.createdTo) {
    query.set("createdTo", params.filters.createdTo);
  }

  if (params.filters.sortBy) {
    query.set("sortBy", params.filters.sortBy);
  }

  if (params.filters.sortDirection) {
    query.set("sortDirection", params.filters.sortDirection);
  }

  return query.toString();
};

export const reviewsApi = {
  list: (params: { page: number; pageSize: number; filters: ReviewListFilters }) =>
    request<PaginatedResult<AdminReviewListItemDTO>>(`/api/admin/reviews?${buildReviewListQuery(params)}`),

  detail: (reviewId: string) => request<AdminReviewDetailDTO>(`/api/admin/reviews/${reviewId}`),

  history: (reviewId: string) =>
    request<ReviewModerationHistoryDTO[]>(`/api/admin/reviews/${reviewId}/history`),

  hide: (reviewId: string, reason: string) =>
    request<AdminReviewDetailDTO>(`/api/admin/reviews/${reviewId}/hide`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),

  unhide: (reviewId: string, reason?: string) =>
    request<AdminReviewDetailDTO>(`/api/admin/reviews/${reviewId}/unhide`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),

  softDelete: (reviewId: string, reason: string) =>
    request<AdminReviewDetailDTO>(`/api/admin/reviews/${reviewId}`, {
      method: "DELETE",
      body: JSON.stringify({ reason }),
    }),
};
