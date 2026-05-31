import { getEffectiveNavigationForUser } from "@/modules/access-control/services/get-effective-navigation";
import { AuditLogsDashboard } from "@/modules/audit-logs/components/audit-logs-dashboard";
import { requireAdminSession } from "@/modules/auth/services/require-admin-session";
import { AdminLayout } from "@/shared/components/admin-layout";
import { auditLogListQuerySchema } from "@/modules/audit-logs/schemas/audit-log-dashboard";
import { createAuditLogDashboardUseCases } from "@/core/infrastructure/http/audit-logs/audit-log-dashboard-factory";
import type { AuditLogDashboardInitialState } from "@/modules/audit-logs/hooks/use-audit-log-dashboard";

export default async function AuditLogsPage() {
  const session = await requireAdminSession();
  const parsedQuery = auditLogListQuerySchema.parse({});
  const { listAdminAuditLogsUseCase } = createAuditLogDashboardUseCases();
  const [navigation, initialList] = await Promise.all([
    getEffectiveNavigationForUser(session.user.id),
    listAdminAuditLogsUseCase.execute(session.user.id, parsedQuery),
  ]);
  const initialState: AuditLogDashboardInitialState = {
    list: initialList,
    queryState: {
      page: parsedQuery.page,
      pageSize: parsedQuery.pageSize,
      filters: {
        search: parsedQuery.search,
        module: parsedQuery.module ?? "ALL",
        action: parsedQuery.action,
        actor: parsedQuery.actor,
        sortBy: parsedQuery.sortBy,
        sortDirection: parsedQuery.sortDirection,
      },
    },
  };

  return (
    <AdminLayout user={session.user} navigation={navigation}>
      <AuditLogsDashboard initialState={initialState} />
    </AdminLayout>
  );
}
