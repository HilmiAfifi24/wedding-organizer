import type { AdminDashboardOverviewDTO, DashboardTimeRange } from "@wo/shared-types";

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

const request = async <T>(url: string) => {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return parseResponse<T>(response);
};

export const dashboardApi = {
  overview: (timeRange: DashboardTimeRange) =>
    request<AdminDashboardOverviewDTO>(`/api/admin/dashboard/overview?timeRange=${timeRange}`),
};
