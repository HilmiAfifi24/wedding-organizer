import { getEffectiveNavigationForUser } from "@/modules/access-control/services/get-effective-navigation";
import { requireAdminSession } from "@/modules/auth/services/require-admin-session";
import { VendorDetailView } from "@/modules/vendors/components/vendor-detail-view";
import { AdminLayout } from "@/shared/components/admin-layout";

type VendorDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function VendorDetailPage({ params }: VendorDetailPageProps) {
  const session = await requireAdminSession();
  const navigation = await getEffectiveNavigationForUser(session.user.id);
  const routeParams = await params;

  return (
    <AdminLayout user={session.user} navigation={navigation}>
      <VendorDetailView vendorId={routeParams.id} />
    </AdminLayout>
  );
}
