import { createUserBookingUseCases } from "@/core/infrastructure/http/user-booking-factory";
import { requireUserRouteAccess } from "@/modules/auth/services/require-user-route-access";
import { BookingsList } from "@/modules/bookings/components/bookings-list";
import { UserShell } from "@/shared/components/user-shell";

export default async function BookingsPage() {
  const session = await requireUserRouteAccess("protected");
  const { listUserBookingsUseCase } = createUserBookingUseCases();
  const bookings = await listUserBookingsUseCase.execute(session);

  return (
    <UserShell
      session={session}
      title="Booking Saya"
      description="Pantau seluruh booking vendor Anda, mulai dari permintaan awal hingga status final acara."
    >
      <BookingsList items={bookings} />
    </UserShell>
  );
}
