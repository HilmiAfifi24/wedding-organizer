import { createCategoryManagementUseCases } from "@/core/infrastructure/http/categories/category-management-factory";
import { getEffectiveNavigationForUser } from "@/modules/access-control/services/get-effective-navigation";
import { requireAdminSession } from "@/modules/auth/services/require-admin-session";
import { CategoriesManagementDashboard } from "@/modules/categories/components/categories-management-dashboard";
import type { CategoryManagementInitialState } from "@/modules/categories/hooks/use-category-management";
import { categoryListQuerySchema } from "@/modules/categories/schemas/category-management";
import { AdminLayout } from "@/shared/components/admin-layout";

export default async function CategoriesPage() {
  const session = await requireAdminSession();
  const parsedQuery = categoryListQuerySchema.parse({});
  const { listAdminCategoriesUseCase } = createCategoryManagementUseCases();

  const [navigation, initialList] = await Promise.all([
    getEffectiveNavigationForUser(session.user.id),
    listAdminCategoriesUseCase.execute(session.user.id, parsedQuery),
  ]);

  const initialState: CategoryManagementInitialState = {
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
      <CategoriesManagementDashboard initialState={initialState} />
    </AdminLayout>
  );
}
