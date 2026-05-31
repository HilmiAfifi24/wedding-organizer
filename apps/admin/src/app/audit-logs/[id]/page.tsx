import { getEffectiveNavigationForUser } from "@/modules/access-control/services/get-effective-navigation";
import { AuditLogDetailView } from "@/modules/audit-logs/components/audit-log-detail-view";
import { requireAdminSession } from "@/modules/auth/services/require-admin-session";
import { AdminLayout } from "@/shared/components/admin-layout";

export default async function AuditLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdminSession();
  const [navigation, { id }] = await Promise.all([
    getEffectiveNavigationForUser(session.user.id),
    params,
  ]);

  return (
    <AdminLayout user={session.user} navigation={navigation}>
      <AuditLogDetailView auditLogId={id} />
    </AdminLayout>
  );
}
