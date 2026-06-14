import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button, Card, CardContent } from "@wo/ui-components";

import { createPublicVendorUseCases } from "@/core/infrastructure/http/public-vendor-factory";
import { requireUserRouteAccess } from "@/modules/auth/services/require-user-route-access";
import { USER_AUTH_ROUTES } from "@/modules/auth/constants/routes";
import { BookingForm } from "@/modules/bookings/components/booking-form";
import { bookingCreatePageQuerySchema } from "@/modules/bookings/schemas/create-booking";
import { UserShell } from "@/shared/components/user-shell";

export default async function CreateBookingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireUserRouteAccess("protected");
  const rawParams = await searchParams;
  const parsed = bookingCreatePageQuerySchema.safeParse({
    vendorId: typeof rawParams.vendorId === "string" ? rawParams.vendorId : undefined,
    serviceId: typeof rawParams.serviceId === "string" ? rawParams.serviceId : undefined,
  });

  if (!parsed.success) {
    redirect(USER_AUTH_ROUTES.vendors);
  }

  const { getPublicVendorDetailUseCase, listPublicVendorServicesUseCase } =
    createPublicVendorUseCases();
  const [vendor, services] = await Promise.all([
    getPublicVendorDetailUseCase.execute(parsed.data.vendorId),
    listPublicVendorServicesUseCase.execute(parsed.data.vendorId),
  ]);

  if (!vendor || !services) {
    notFound();
  }

  return (
    <UserShell
      session={session}
      title="Buat Booking"
      description="Lengkapi detail acara Anda untuk mengirim permintaan booking ke vendor terpilih."
    >
      {services.length ? (
        <BookingForm
          vendor={vendor}
          services={services}
          selectedServiceId={parsed.data.serviceId}
          initialCustomer={{
            customerName: session.fullName || "",
            customerPhone: session.phoneNumber || "",
            customerEmail: session.email,
          }}
        />
      ) : (
        <Card className="rounded-[28px] border border-dashed border-slate-200 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <CardContent className="space-y-4 p-8 text-center">
            <p className="text-2xl font-semibold text-slate-950">Belum ada layanan aktif</p>
            <p className="text-sm leading-6 text-slate-600">
              Vendor ini belum memiliki paket aktif yang bisa dipesan saat ini.
            </p>
            <Button asChild className="h-11 rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
              <Link href={`/vendors/${vendor.id}`}>Kembali ke detail vendor</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </UserShell>
  );
}
