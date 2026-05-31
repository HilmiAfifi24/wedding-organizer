import { createBookingManagementUseCases } from "@/core/infrastructure/http/bookings/booking-management-factory";
import { getEffectiveNavigationForUser } from "@/modules/access-control/services/get-effective-navigation";
import { requireAdminSession } from "@/modules/auth/services/require-admin-session";
import { BookingsManagementDashboard } from "@/modules/bookings/components/bookings-management-dashboard";
import type { BookingManagementInitialState } from "@/modules/bookings/hooks/use-booking-management";
import { bookingListQuerySchema } from "@/modules/bookings/schemas/booking-management";
import { AdminLayout } from "@/shared/components/admin-layout";

export default async function BookingsPage() {
  const session = await requireAdminSession();
  const parsedQuery = bookingListQuerySchema.parse({});
  const { listAdminBookingsUseCase } = createBookingManagementUseCases();
  const [navigation, initialList] = await Promise.all([
    getEffectiveNavigationForUser(session.user.id),
    listAdminBookingsUseCase.execute(session.user.id, parsedQuery),
  ]);
  const initialState: BookingManagementInitialState = {
    list: initialList,
    queryState: {
      page: parsedQuery.page,
      pageSize: parsedQuery.pageSize,
      filters: {
        search: parsedQuery.search,
        status: parsedQuery.status ?? "ALL",
        vendor: parsedQuery.vendor,
        user: parsedQuery.user,
        sortBy: parsedQuery.sortBy,
        sortDirection: parsedQuery.sortDirection,
      },
    },
  };

  return (
    <AdminLayout user={session.user} navigation={navigation}>
      <BookingsManagementDashboard initialState={initialState} />
    </AdminLayout>
  );
}
