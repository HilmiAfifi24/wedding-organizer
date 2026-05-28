import { getEffectiveNavigationForUser } from "@/modules/access-control/services/get-effective-navigation";
import { requireAdminSession } from "@/modules/auth/services/require-admin-session";
import { BookingsManagementDashboard } from "@/modules/bookings/components/bookings-management-dashboard";
import { AdminLayout } from "@/shared/components/admin-layout";

export default async function BookingsPage() {
  const session = await requireAdminSession();
  const navigation = await getEffectiveNavigationForUser(session.user.id);

  return (
    <AdminLayout user={session.user} navigation={navigation}>
      <BookingsManagementDashboard />
    </AdminLayout>
  );
}
