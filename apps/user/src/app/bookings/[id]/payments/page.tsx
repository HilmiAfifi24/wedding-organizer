import { notFound } from "next/navigation";

import { createUserPaymentUseCases } from "@/core/infrastructure/http/user-payment-factory";
import { requireUserRouteAccess } from "@/modules/auth/services/require-user-route-access";
import { BookingPaymentsSummary } from "@/modules/payments/components/booking-payments-summary";
import { UserShell } from "@/shared/components/user-shell";

export default async function BookingPaymentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUserRouteAccess("protected");
  const { id } = await params;
  const { getUserBookingPaymentsUseCase } = createUserPaymentUseCases();
  const summary = await getUserBookingPaymentsUseCase.execute(id, session).catch(() => null);

  if (!summary) {
    notFound();
  }

  return (
    <UserShell
      session={session}
      title="Pembayaran Booking"
      description="Lihat ringkasan pembayaran, sisa tagihan, dan semua termin pembayaran untuk booking ini."
    >
      <BookingPaymentsSummary summary={summary} />
    </UserShell>
  );
}
