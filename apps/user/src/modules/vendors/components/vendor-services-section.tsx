"use client";

import { useMemo, useState } from "react";
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
  const [selectedAdatName, setSelectedAdatName] = useState<string>("Semua");

  const uniqueAdats = useMemo(() => {
    const names = new Set<string>();
    services.forEach((s) => {
      s.adats?.forEach((a) => names.add(a.name));
    });
    return ["Semua", ...Array.from(names)];
  }, [services]);

  const filteredServices = useMemo(() => {
    if (selectedAdatName === "Semua") return services;
    return services.filter((s) =>
      s.adats?.some((a) => a.name === selectedAdatName)
    );
  }, [services, selectedAdatName]);

  return (
    <Card className="rounded-[28px] border-white/10 bg-card shadow-2xl">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-2xl text-white">Services & Packages</CardTitle>

        {services.length > 0 && uniqueAdats.length > 2 && (
          <div className="flex flex-wrap gap-2">
            {uniqueAdats.map((name) => {
              const isActive = selectedAdatName === name;
              return (
                <button
                  key={name}
                  onClick={() => setSelectedAdatName(name)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-rose-600 text-white shadow-md"
                      : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {name === "Semua" ? "Semua Adat" : name}
                </button>
              );
            })}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {filteredServices.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-4"
              >
                <div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                    <p className="text-sm leading-6 text-slate-300">
                      {service.description || "Vendor belum menambahkan deskripsi paket ini."}
                    </p>
                  </div>
                  {service.adats && service.adats.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {service.adats.map((adat) => (
                        <span
                          key={adat.id}
                          className="rounded-full bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[10px] text-rose-400 font-semibold"
                        >
                          {adat.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <p className="mt-4 text-sm font-semibold text-rose-400">
                    {formatPrice(service.price)}
                  </p>
                  <Button
                    asChild
                    className="mt-4 h-10 w-full rounded-2xl bg-rose-600 text-white hover:bg-rose-700"
                  >
                    <Link href={getServiceBookingHref(vendorId, service.id, session)}>
                      Booking paket ini
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
            {services.length
              ? "Tidak ada layanan yang cocok dengan filter adat terpilih."
              : "Belum ada layanan aktif yang dipublikasikan vendor ini."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
