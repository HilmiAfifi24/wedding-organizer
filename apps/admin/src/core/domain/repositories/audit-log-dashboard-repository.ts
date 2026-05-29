import type {
  AdminAuditLogDetailDTO,
  AdminAuditLogListItemDTO,
  AdminAuditLogsQuery,
} from "@wo/shared-types";

import type { AuditLogDashboardPermissionFlags } from "@/core/domain/entities/audit-log-dashboard";

export interface AuditLogDashboardRepository {
  getActorPermissionByMenuCode(
    actorId: string,
    menuCode: string
  ): Promise<AuditLogDashboardPermissionFlags | null>;

  listAuditLogs(
    query: Required<Pick<AdminAuditLogsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">> &
      Omit<AdminAuditLogsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">
  ): Promise<{ items: AdminAuditLogListItemDTO[]; totalItems: number }>;

  getAuditLogById(auditLogId: string): Promise<AdminAuditLogDetailDTO | null>;
}
