import { notFound } from "next/navigation";

import { createUserBookingUseCases } from "@/core/infrastructure/http/user-booking-factory";
import { requireUserRouteAccess } from "@/modules/auth/services/require-user-route-access";
import { BookingDetailView } from "@/modules/bookings/components/booking-detail-view";
import { bookingDetailParamSchema } from "@/modules/bookings/schemas/tracking";
import { UserShell } from "@/shared/components/user-shell";

export default async function BookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireUserRouteAccess("protected");
  const parsedParams = bookingDetailParamSchema.safeParse(await params);
  if (!parsedParams.success) {
    notFound();
  }

  const { id } = parsedParams.data;
  const rawSearchParams = await searchParams;
  const { getUserBookingDetailUseCase } = createUserBookingUseCases();
  const booking = await getUserBookingDetailUseCase.execute(id, session).catch(() => null);

  if (!booking) {
    notFound();
  }

  const showCreatedMessage = rawSearchParams.created === "1";

  return (
    <UserShell
      session={session}
      title="Detail Booking"
      description="Pantau status permintaan booking dan semua detail acara Anda dari satu tempat."
    >
      <BookingDetailView booking={booking} showCreatedMessage={showCreatedMessage} />
    </UserShell>
  );
}
