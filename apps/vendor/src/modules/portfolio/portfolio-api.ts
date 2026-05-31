import type { MediaType, PortfolioDTO } from "@wo/shared-types";

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

export const vendorPortfolioApi = {
  list: () => request<PortfolioDTO[]>("/api/vendor/portfolio"),
  create: (data: { title?: string; description?: string; mediaUrl: string; mediaType: MediaType }) =>
    request<PortfolioDTO>("/api/vendor/portfolio", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  remove: (portfolioId: string) =>
    request<Record<string, never>>(`/api/vendor/portfolio/${portfolioId}`, {
      method: "DELETE",
    }),
};
