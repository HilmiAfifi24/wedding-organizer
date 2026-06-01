import type {
  AdminBookingDetailDTO,
  AdminBookingListItemDTO,
  BookingStatusHistoryDTO,
  PaginatedResult,
  UpdateBookingStatusInput,
} from "@wo/shared-types";

import type { BookingListFilters } from "../types";

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

const buildBookingListQuery = (params: {
  page: number;
  pageSize: number;
  filters: BookingListFilters;
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

  if (params.filters.bookedFrom) {
    query.set("bookedFrom", params.filters.bookedFrom);
  }

  if (params.filters.bookedTo) {
    query.set("bookedTo", params.filters.bookedTo);
  }

  if (params.filters.customer?.trim()) {
    query.set("customer", params.filters.customer.trim());
  }

  if (params.filters.service?.trim()) {
    query.set("service", params.filters.service.trim());
  }

  if (params.filters.sortBy) {
    query.set("sortBy", params.filters.sortBy);
  }

  if (params.filters.sortDirection) {
    query.set("sortDirection", params.filters.sortDirection);
  }

  return query.toString();
};

export const vendorBookingsApi = {
  list: (params: { page: number; pageSize: number; filters: BookingListFilters }) =>
    request<PaginatedResult<AdminBookingListItemDTO>>(
      `/api/vendor/bookings?${buildBookingListQuery(params)}`
    ),

  detail: (bookingId: string) =>
    request<AdminBookingDetailDTO>(`/api/vendor/bookings/${bookingId}`),

  history: (bookingId: string) =>
    request<BookingStatusHistoryDTO[]>(`/api/vendor/bookings/${bookingId}/history`),

  updateStatus: (bookingId: string, input: UpdateBookingStatusInput) =>
    request<AdminBookingDetailDTO>(`/api/vendor/bookings/${bookingId}/status`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
};
