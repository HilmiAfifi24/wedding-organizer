import { createUserBookingUseCases } from "@/core/infrastructure/http/user-booking-factory";
import { parseBookingEventDate } from "@/modules/bookings/services/event-date";
import { bookingListQuerySchema } from "@/modules/bookings/schemas/tracking";
import { requireUserRouteAccess } from "@/modules/auth/services/require-user-route-access";
import { BookingsList } from "@/modules/bookings/components/bookings-list";
import { UserShell } from "@/shared/components/user-shell";

const pickFirstSearchParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireUserRouteAccess("protected");
  const rawSearchParams = await searchParams;
  const normalizedQuery = Object.fromEntries(
    Object.entries(rawSearchParams).map(([key, value]) => [key, pickFirstSearchParam(value)])
  );
  const parsedQueryResult = bookingListQuerySchema.safeParse(normalizedQuery);
  const parsedQuery = parsedQueryResult.success
    ? parsedQueryResult.data
    : bookingListQuerySchema.parse({});
  const { listUserBookingsUseCase } = createUserBookingUseCases();
  const bookings = await listUserBookingsUseCase.execute(
    {
      ...parsedQuery,
      eventDateFrom: parsedQuery.eventDateFrom
        ? parseBookingEventDate(parsedQuery.eventDateFrom)
        : undefined,
      eventDateTo: parsedQuery.eventDateTo
        ? parseBookingEventDate(parsedQuery.eventDateTo)
        : undefined,
    },
    session
  );

  return (
    <UserShell
      session={session}
      title="Booking Saya"
      description="Pantau seluruh booking vendor Anda, mulai dari permintaan awal hingga status final acara."
    >
      <BookingsList
        result={bookings}
        filters={{
          page: parsedQuery.page,
          limit: parsedQuery.limit,
          sort: parsedQuery.sort,
          search: parsedQuery.search,
          bookingStatus: parsedQuery.bookingStatus,
          paymentStatus: parsedQuery.paymentStatus,
          eventDateFrom: parsedQuery.eventDateFrom,
          eventDateTo: parsedQuery.eventDateTo,
        }}
      />
    </UserShell>
  );
}
