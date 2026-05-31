import { createUserManagementUseCases } from "@/core/infrastructure/http/users/user-management-factory";
import { UsersManagementDashboard } from "@/modules/users/components/users-management-dashboard";
import type { UserManagementInitialState } from "@/modules/users/hooks/use-user-management";
import { userListQuerySchema } from "@/modules/users/schemas/user-management";
import { getEffectiveNavigationForUser } from "@/modules/access-control/services/get-effective-navigation";
import { requireAdminSession } from "@/modules/auth/services/require-admin-session";
import { AdminLayout } from "@/shared/components/admin-layout";

export default async function UsersPage() {
  const session = await requireAdminSession();
  const parsedQuery = userListQuerySchema.parse({});
  const { listAdminUsersUseCase } = createUserManagementUseCases();
  const [navigation, initialList] = await Promise.all([
    getEffectiveNavigationForUser(session.user.id),
    listAdminUsersUseCase.execute(session.user.id, parsedQuery),
  ]);
  const initialState: UserManagementInitialState = {
    list: initialList,
    queryState: {
      page: parsedQuery.page,
      pageSize: parsedQuery.pageSize,
      filters: {
        search: parsedQuery.search,
        role: parsedQuery.role ?? "ALL",
        status: parsedQuery.status ?? "ALL",
        sortBy: parsedQuery.sortBy,
        sortDirection: parsedQuery.sortDirection,
        includeDeleted: parsedQuery.includeDeleted,
      },
    },
  };

  return (
    <AdminLayout user={session.user} navigation={navigation}>
      <UsersManagementDashboard currentUserId={session.user.id} initialState={initialState} />
    </AdminLayout>
  );
}
