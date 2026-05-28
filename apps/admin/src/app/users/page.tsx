import { UsersManagementDashboard } from "@/modules/users/components/users-management-dashboard";
import { getEffectiveNavigationForUser } from "@/modules/access-control/services/get-effective-navigation";
import { requireAdminSession } from "@/modules/auth/services/require-admin-session";
import { AdminLayout } from "@/shared/components/admin-layout";

export default async function UsersPage() {
  const session = await requireAdminSession();
  const navigation = await getEffectiveNavigationForUser(session.user.id);

  return (
    <AdminLayout user={session.user} navigation={navigation}>
      <UsersManagementDashboard currentUserId={session.user.id} />
    </AdminLayout>
  );
}
