import { requireVendorRouteAccess } from "@/modules/auth/services/require-vendor-route-access";
import { BookingDetailView } from "@/modules/bookings/components/booking-detail-view";
import { VendorShell } from "@/shared/components/vendor-shell";

export default async function VendorBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireVendorRouteAccess("protected");
  const { id } = await params;

  return (
    <VendorShell
      session={session}
      title="Detail Booking"
      description="Lihat detail booking, payment proof, dan timeline perubahan status untuk layanan vendor Anda."
    >
      <BookingDetailView bookingId={id} />
    </VendorShell>
  );
}
