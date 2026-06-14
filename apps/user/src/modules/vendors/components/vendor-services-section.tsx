import Link from "next/link";
import { type UserSessionDTO } from "@wo/shared-types";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";

import type { PublicVendorServiceItemDTO } from "../types";
import { formatPrice } from "../constants";
import { USER_AUTH_ROUTES } from "@/modules/auth/constants/routes";

const getServiceBookingHref = (vendorId: string, serviceId: string, session: UserSessionDTO | null) => {
  const bookingHref = `/vendors/${vendorId}/booking?serviceId=${serviceId}`;

  return session
    ? bookingHref
    : `${USER_AUTH_ROUTES.login}?callbackUrl=${encodeURIComponent(bookingHref)}`;
};

export function VendorServicesSection({
  vendorId,
  services,
  session,
}: {
  vendorId: string;
  services: PublicVendorServiceItemDTO[];
  session: UserSessionDTO | null;
}) {
  return (
    <Card className="rounded-[28px] border-white/80 bg-white/88 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
      <CardHeader>
        <CardTitle className="text-2xl text-slate-950">Services & Packages</CardTitle>
      </CardHeader>
      <CardContent>
        {services.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="rounded-3xl border border-slate-100 bg-slate-50/90 p-4"
              >
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-950">{service.name}</h3>
                  <p className="text-sm leading-6 text-slate-600">
                    {service.description || "Vendor belum menambahkan deskripsi paket ini."}
                  </p>
                </div>
                <p className="mt-4 text-sm font-semibold text-rose-600">
                  {formatPrice(service.price)}
                </p>
                <Button
                  asChild
                  className="mt-4 h-10 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
                >
                  <Link href={getServiceBookingHref(vendorId, service.id, session)}>
                    Booking paket ini
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-sm text-slate-600">
            Belum ada layanan aktif yang dipublikasikan vendor ini.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
