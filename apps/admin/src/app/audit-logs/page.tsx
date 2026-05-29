import { getEffectiveNavigationForUser } from "@/modules/access-control/services/get-effective-navigation";
import { AuditLogsDashboard } from "@/modules/audit-logs/components/audit-logs-dashboard";
import { requireAdminSession } from "@/modules/auth/services/require-admin-session";
import { AdminLayout } from "@/shared/components/admin-layout";

export default async function AuditLogsPage() {
  const session = await requireAdminSession();
  const navigation = await getEffectiveNavigationForUser(session.user.id);

  return (
    <AdminLayout user={session.user} navigation={navigation}>
      <AuditLogsDashboard />
    </AdminLayout>
  );
}
