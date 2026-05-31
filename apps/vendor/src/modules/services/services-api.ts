import type { ServiceDTO } from "@wo/shared-types";

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

export const vendorServicesApi = {
  list: () => request<ServiceDTO[]>("/api/vendor/services"),
  create: (data: { name: string; description?: string; price: number; isActive?: boolean }) =>
    request<ServiceDTO>("/api/vendor/services", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (
    serviceId: string,
    data: { name?: string; description?: string; price?: number; isActive?: boolean }
  ) =>
    request<ServiceDTO>(`/api/vendor/services/${serviceId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (serviceId: string) =>
    request<Record<string, never>>(`/api/vendor/services/${serviceId}`, {
      method: "DELETE",
    }),
};
