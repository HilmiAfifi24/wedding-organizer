import type { AdminAuditLogsQuery } from "@wo/shared-types";

import {
  AUDIT_LOG_DASHBOARD_MENU_CODE,
  type AuditLogDashboardPermissionFlags,
} from "@/core/domain/entities/audit-log-dashboard";
import type { AuditLogDashboardRepository } from "@/core/domain/repositories";

import type {
  AuditLogDetailResponse,
  AuditLogListResponse,
  ParsedAuditLogListQuery,
} from "../../dto/audit-logs/audit-log-dashboard-dto";

const assertPermission = (
  permission: AuditLogDashboardPermissionFlags | null,
  key: keyof AuditLogDashboardPermissionFlags,
  message: string
) => {
  if (!permission || !permission[key]) {
    throw new Error(message);
  }
};

const defaultSortBy: NonNullable<AdminAuditLogsQuery["sortBy"]> = "createdAt";
const defaultSortDirection: NonNullable<AdminAuditLogsQuery["sortDirection"]> = "desc";

const toPagedResult = (
  query: Pick<ParsedAuditLogListQuery, "page" | "pageSize">,
  totalItems: number,
  items: AuditLogListResponse["items"]
): AuditLogListResponse => ({
  items,
  page: query.page,
  pageSize: query.pageSize,
  totalItems,
  totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
});

export class ListAdminAuditLogsUseCase {
  constructor(private readonly repository: AuditLogDashboardRepository) {}

  async execute(actorId: string, query: ParsedAuditLogListQuery): Promise<AuditLogListResponse> {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      AUDIT_LOG_DASHBOARD_MENU_CODE
    );

    assertPermission(permission, "canView", "Forbidden: no permission to view audit logs");
    assertPermission(permission, "canHistory", "Forbidden: no permission to access audit logs");

    const normalizedQuery: ParsedAuditLogListQuery = {
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
      module: query.module,
      action: query.action,
      actor: query.actor,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      sortBy: query.sortBy ?? defaultSortBy,
      sortDirection: query.sortDirection ?? defaultSortDirection,
    };

    const result = await this.repository.listAuditLogs(normalizedQuery);
    return toPagedResult(normalizedQuery, result.totalItems, result.items);
  }
}

export class GetAdminAuditLogDetailUseCase {
  constructor(private readonly repository: AuditLogDashboardRepository) {}

  async execute(actorId: string, auditLogId: string): Promise<AuditLogDetailResponse> {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      AUDIT_LOG_DASHBOARD_MENU_CODE
    );

    assertPermission(permission, "canView", "Forbidden: no permission to view audit log detail");
    assertPermission(permission, "canHistory", "Forbidden: no permission to access audit log detail");

    const auditLog = await this.repository.getAuditLogById(auditLogId);
    if (!auditLog) {
      throw new Error("Audit log not found");
    }

    return auditLog;
  }
}
