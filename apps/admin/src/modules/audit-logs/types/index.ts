import type {
  AdminAuditLogDetailDTO,
  AdminAuditLogListItemDTO,
  AuditModule,
  PaginatedResult,
} from "@wo/shared-types";

export interface AuditLogListFilters {
  search?: string;
  module?: AuditModule | "ALL";
  action?: string;
  actor?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "createdAt";
  sortDirection?: "asc" | "desc";
}

export type AuditLogListResult = PaginatedResult<AdminAuditLogListItemDTO>;
export type AuditLogDetailResult = AdminAuditLogDetailDTO;
