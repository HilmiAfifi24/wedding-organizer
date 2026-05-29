import { getEffectiveNavigationForUser } from "@/modules/access-control/services/get-effective-navigation";
import { requireAdminSession } from "@/modules/auth/services/require-admin-session";
import { ReviewsManagementDashboard } from "@/modules/reviews/components/reviews-management-dashboard";
import { AdminLayout } from "@/shared/components/admin-layout";

export default async function ReviewsPage() {
  const session = await requireAdminSession();
  const navigation = await getEffectiveNavigationForUser(session.user.id);

  return (
    <AdminLayout user={session.user} navigation={navigation}>
      <ReviewsManagementDashboard />
    </AdminLayout>
  );
}
