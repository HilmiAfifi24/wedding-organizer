import type {
  AdminAuditLogDetailDTO,
  AdminAuditLogListItemDTO,
  AdminAuditLogsQuery,
  PaginatedResult,
} from "@wo/shared-types";

export type AuditLogListResponse = PaginatedResult<AdminAuditLogListItemDTO>;
export type AuditLogDetailResponse = AdminAuditLogDetailDTO;

export interface ParsedAuditLogListQuery
  extends Required<Pick<AdminAuditLogsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">>,
    Omit<AdminAuditLogsQuery, "page" | "pageSize" | "sortBy" | "sortDirection"> {}
