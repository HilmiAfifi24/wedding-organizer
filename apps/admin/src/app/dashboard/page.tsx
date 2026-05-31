import { DashboardTimeRange } from "@wo/shared-types";

import { getEffectiveNavigationForUser } from "@/modules/access-control/services/get-effective-navigation";
import { requireAdminSession } from "@/modules/auth/services/require-admin-session";
import { DashboardOverview } from "@/modules/dashboard/components/dashboard-overview";
import { getDashboardOverview } from "@/modules/dashboard/services/get-dashboard-overview";
import { AdminLayout } from "@/shared/components/admin-layout";

export default async function DashboardPage() {
  const session = await requireAdminSession();
  const [navigation, overviewResult] = await Promise.all([
    getEffectiveNavigationForUser(session.user.id),
    getDashboardOverview(session.user.id, DashboardTimeRange.LAST_30_DAYS)
      .then((data) => ({ data, error: null as string | null }))
      .catch((error: unknown) => ({
        data: null,
        error: error instanceof Error ? error.message : "Gagal memuat dashboard overview",
      })),
  ]);

  return (
    <AdminLayout user={session.user} navigation={navigation}>
      {overviewResult.data ? (
        <DashboardOverview
          initialData={overviewResult.data}
          initialError={overviewResult.error}
          actorName={session.user.name}
        />
      ) : (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-6 text-sm text-danger">
          {overviewResult.error || "Dashboard overview tidak dapat dimuat."}
        </div>
      )}
    </AdminLayout>
  );
}
