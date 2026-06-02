import type { PaymentProofStatusHistoryDTO } from "@wo/shared-types";

import type {
  VendorPaymentDetailDTO,
  VendorPaymentListResponse,
} from "@/core/application/dto/payments/vendor-payment-management-dto";

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

  if (params.filters.customer?.trim()) {
    query.set("customer", params.filters.customer.trim());
  }

  if (params.filters.bookedFrom) {
    query.set("bookedFrom", params.filters.bookedFrom);
  }

  if (params.filters.bookedTo) {
    query.set("bookedTo", params.filters.bookedTo);
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

export const vendorPaymentsApi = {
  list: (params: { page: number; pageSize: number; filters: PaymentProofListFilters }) =>
    request<VendorPaymentListResponse>(`/api/vendor/payments?${buildPaymentProofListQuery(params)}`),

  detail: (paymentProofId: string) => request<VendorPaymentDetailDTO>(`/api/vendor/payments/${paymentProofId}`),

  history: (paymentProofId: string) =>
    request<PaymentProofStatusHistoryDTO[]>(`/api/vendor/payments/${paymentProofId}/history`),

  verify: (paymentProofId: string, verificationNote?: string) =>
    request<VendorPaymentDetailDTO>(`/api/vendor/payments/${paymentProofId}/verify`, {
      method: "PATCH",
      body: JSON.stringify({ verificationNote }),
    }),

  reject: (paymentProofId: string, reason: string) =>
    request<VendorPaymentDetailDTO>(`/api/vendor/payments/${paymentProofId}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),
};
