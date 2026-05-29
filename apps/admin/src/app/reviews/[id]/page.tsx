import { getEffectiveNavigationForUser } from "@/modules/access-control/services/get-effective-navigation";
import { requireAdminSession } from "@/modules/auth/services/require-admin-session";
import { ReviewDetailView } from "@/modules/reviews/components/review-detail-view";
import { AdminLayout } from "@/shared/components/admin-layout";

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdminSession();
  const navigation = await getEffectiveNavigationForUser(session.user.id);
  const { id } = await params;

  return (
    <AdminLayout user={session.user} navigation={navigation}>
      <ReviewDetailView reviewId={id} />
    </AdminLayout>
  );
}
