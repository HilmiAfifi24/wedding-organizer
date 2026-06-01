import { createVendorBookingManagementUseCases } from "@/core/infrastructure/http/bookings/vendor-booking-management-factory";
import { BookingsManagementDashboard } from "@/modules/bookings/components/bookings-management-dashboard";
import type { BookingManagementInitialState } from "@/modules/bookings/hooks/use-booking-management";
import { vendorBookingListQuerySchema } from "@/modules/bookings/schemas/booking-management";
import { requireVendorRouteAccess } from "@/modules/auth/services/require-vendor-route-access";
import { VendorShell } from "@/shared/components/vendor-shell";

export default async function VendorBookingsPage() {
  const session = await requireVendorRouteAccess("protected");
  const parsedQuery = vendorBookingListQuerySchema.parse({});
  const { listVendorBookingsUseCase } = createVendorBookingManagementUseCases();
  const initialList = await listVendorBookingsUseCase.execute(session.vendorId, parsedQuery);
  const initialState: BookingManagementInitialState = {
    list: initialList,
    queryState: {
      page: parsedQuery.page,
      pageSize: parsedQuery.pageSize,
      filters: {
        search: parsedQuery.search,
        status: parsedQuery.status ?? "ALL",
        bookedFrom: undefined,
        bookedTo: undefined,
        customer: parsedQuery.customer,
        service: parsedQuery.service,
        sortBy: parsedQuery.sortBy,
        sortDirection: parsedQuery.sortDirection,
      },
    },
  };

  return (
    <VendorShell
      session={session}
      title="Booking Vendor"
      description="Kelola booking layanan Anda: pantau customer, cek pembayaran, dan proses status booking sesuai workflow vendor."
    >
      <BookingsManagementDashboard initialState={initialState} />
    </VendorShell>
  );
}
