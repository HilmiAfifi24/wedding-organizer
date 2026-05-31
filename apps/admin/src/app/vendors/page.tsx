import { getEffectiveNavigationForUser } from "@/modules/access-control/services/get-effective-navigation";
import { requireAdminSession } from "@/modules/auth/services/require-admin-session";
import { VendorsManagementDashboard } from "@/modules/vendors/components/vendors-management-dashboard";
import type { VendorManagementInitialState } from "@/modules/vendors/hooks/use-vendor-management";
import { vendorListQuerySchema } from "@/modules/vendors/schemas/vendor-management";
import { AdminLayout } from "@/shared/components/admin-layout";
import { createVendorManagementUseCases } from "@/core/infrastructure/http/vendors/vendor-management-factory";

export default async function VendorsPage() {
  const session = await requireAdminSession();
  const parsedQuery = vendorListQuerySchema.parse({});
  const { listAdminVendorsUseCase } = createVendorManagementUseCases();
  const [navigation, initialList] = await Promise.all([
    getEffectiveNavigationForUser(session.user.id),
    listAdminVendorsUseCase.execute(session.user.id, parsedQuery),
  ]);
  const initialState: VendorManagementInitialState = {
    list: initialList,
    queryState: {
      page: parsedQuery.page,
      pageSize: parsedQuery.pageSize,
      filters: {
        search: parsedQuery.search,
        status: parsedQuery.status ?? "ALL",
        sortBy: parsedQuery.sortBy,
        sortDirection: parsedQuery.sortDirection,
        includeDeleted: parsedQuery.includeDeleted,
      },
    },
  };

  return (
    <AdminLayout user={session.user} navigation={navigation}>
      <VendorsManagementDashboard initialState={initialState} />
    </AdminLayout>
  );
}
