import type {
  AdminPaymentProofDetailDTO,
  AdminPaymentProofListItemDTO,
  PaginatedResult,
  PaymentProofStatusHistoryDTO,
} from "@wo/shared-types";

import type { PaymentProofListFilters } from "../types";

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

const buildPaymentProofListQuery = (params: {
  page: number;
  pageSize: number;
  filters: PaymentProofListFilters;
}) => {
  const query = new URLSearchParams();

  query.set("page", String(params.page));
  query.set("pageSize", String(params.pageSize));

  if (params.filters.search?.trim()) {
    query.set("search", params.filters.search.trim());
  }

  if (params.filters.paymentProofStatus && params.filters.paymentProofStatus !== "ALL") {
    query.set("paymentProofStatus", params.filters.paymentProofStatus);
  }

  if (params.filters.bookingStatus && params.filters.bookingStatus !== "ALL") {
    query.set("bookingStatus", params.filters.bookingStatus);
  }

  if (params.filters.vendor?.trim()) {
    query.set("vendor", params.filters.vendor.trim());
  }

  if (params.filters.uploadedFrom) {
    query.set("uploadedFrom", params.filters.uploadedFrom);
  }

  if (params.filters.uploadedTo) {
    query.set("uploadedTo", params.filters.uploadedTo);
  }

  if (params.filters.sortBy) {
    query.set("sortBy", params.filters.sortBy);
  }

  if (params.filters.sortDirection) {
    query.set("sortDirection", params.filters.sortDirection);
  }

  return query.toString();
};

export const paymentsApi = {
  list: (params: { page: number; pageSize: number; filters: PaymentProofListFilters }) =>
    request<PaginatedResult<AdminPaymentProofListItemDTO>>(
      `/api/admin/payment-proofs?${buildPaymentProofListQuery(params)}`
    ),

  detail: (paymentProofId: string) =>
    request<AdminPaymentProofDetailDTO>(`/api/admin/payment-proofs/${paymentProofId}`),

  history: (paymentProofId: string) =>
    request<PaymentProofStatusHistoryDTO[]>(`/api/admin/payment-proofs/${paymentProofId}/history`),

  forceVerify: (paymentProofId: string, reason: string) =>
    request<AdminPaymentProofDetailDTO>(`/api/admin/payment-proofs/${paymentProofId}/force-verify`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),

  forceReject: (paymentProofId: string, reason: string) =>
    request<AdminPaymentProofDetailDTO>(`/api/admin/payment-proofs/${paymentProofId}/force-reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),
};
