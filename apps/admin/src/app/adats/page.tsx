import { createAdatManagementUseCases } from "@/core/infrastructure/http/adats/adat-management-factory";
import { getEffectiveNavigationForUser } from "@/modules/access-control/services/get-effective-navigation";
import { requireAdminSession } from "@/modules/auth/services/require-admin-session";
import { AdatsManagementDashboard } from "@/modules/adats/components/adats-management-dashboard";
import type { AdatManagementInitialState } from "@/modules/adats/hooks/use-adat-management";
import { adatListQuerySchema } from "@/modules/adats/schemas/adat-management";
import { AdminLayout } from "@/shared/components/admin-layout";

export default async function AdatsPage() {
  const session = await requireAdminSession();
  const parsedQuery = adatListQuerySchema.parse({});
  const { listAdminAdatsUseCase } = createAdatManagementUseCases();

  const [navigation, initialList] = await Promise.all([
    getEffectiveNavigationForUser(session.user.id),
    listAdminAdatsUseCase.execute(session.user.id, parsedQuery),
  ]);

  const initialState: AdatManagementInitialState = {
    list: initialList,
    queryState: {
      page: parsedQuery.page,
      pageSize: parsedQuery.pageSize,
      filters: {
        search: parsedQuery.search,
        sortBy: parsedQuery.sortBy,
        sortDirection: parsedQuery.sortDirection,
      },
    },
  };

  return (
    <AdminLayout user={session.user} navigation={navigation}>
      <AdatsManagementDashboard initialState={initialState} />
    </AdminLayout>
  );
}
