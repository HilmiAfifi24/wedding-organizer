import type {
  AdminAuditLogDetailDTO,
  AdminAuditLogListItemDTO,
  PaginatedResult,
} from "@wo/shared-types";

import type { AuditLogListFilters } from "../types";

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

const request = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return parseResponse<T>(response);
};

const buildAuditLogListQuery = (params: {
  page: number;
  pageSize: number;
  filters: AuditLogListFilters;
}) => {
  const query = new URLSearchParams();

  query.set("page", String(params.page));
  query.set("pageSize", String(params.pageSize));

  if (params.filters.search?.trim()) {
    query.set("search", params.filters.search.trim());
  }

  if (params.filters.module && params.filters.module !== "ALL") {
    query.set("module", params.filters.module);
  }

  if (params.filters.action?.trim()) {
    query.set("action", params.filters.action.trim());
  }

  if (params.filters.actor?.trim()) {
    query.set("actor", params.filters.actor.trim());
  }

  if (params.filters.dateFrom) {
    query.set("dateFrom", params.filters.dateFrom);
  }

  if (params.filters.dateTo) {
    query.set("dateTo", params.filters.dateTo);
  }

  if (params.filters.sortBy) {
    query.set("sortBy", params.filters.sortBy);
  }

  if (params.filters.sortDirection) {
    query.set("sortDirection", params.filters.sortDirection);
  }

  return query.toString();
};

export const auditLogsApi = {
  list: (params: { page: number; pageSize: number; filters: AuditLogListFilters }) =>
    request<PaginatedResult<AdminAuditLogListItemDTO>>(
      `/api/admin/audit-logs?${buildAuditLogListQuery(params)}`
    ),

  detail: (auditLogId: string) =>
    request<AdminAuditLogDetailDTO>(`/api/admin/audit-logs/${auditLogId}`),
};
