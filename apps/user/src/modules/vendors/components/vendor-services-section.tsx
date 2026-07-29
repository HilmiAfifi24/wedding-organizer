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
                    {(() => {
                      const items = service.description
                        ? service.description.split(/[•\n\r*|-]+/).map((i) => i.trim()).filter(Boolean)
                        : [];
                      
                      if (items.length === 0) {
                        return (
                          <p className="text-sm leading-6 text-slate-400 italic">
                            Vendor belum menambahkan deskripsi paket ini.
                          </p>
                        );
                      }

                      const maxVisible = 4;
                      const hasMore = items.length > maxVisible;
                      const visibleItems = items.slice(0, maxVisible);
                      const remainingCount = items.length - maxVisible;

                      return (
                        <div className="relative group cursor-help mt-1">
                          {/* Visible List in the Card */}
                          <ul className="space-y-1.5 text-sm text-slate-300">
                            {visibleItems.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                                <span className="text-rose-500 font-bold mt-0.5">•</span>
                                <span className="line-clamp-2">{item}</span>
                              </li>
                            ))}
                            {hasMore && (
                              <li className="flex items-center gap-2 text-xs font-medium text-rose-400 mt-2">
                                <span className="animate-pulse">•••</span>
                                <span>+{remainingCount} layanan lainnya (Arahkan kursor)</span>
                              </li>
                            )}
                          </ul>

                          {/* Hover Tooltip (Full List) */}
                          {hasMore && (
                            <div className="absolute z-[99] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 bottom-full left-1/2 -translate-x-1/2 mb-3 w-[340px] max-w-[90vw] p-4 rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-md shadow-2xl text-xs text-slate-200">
                              <div className="font-semibold mb-2 text-white border-b border-white/10 pb-1.5 flex justify-between items-center">
                                <span>Detail Paket Lengkap</span>
                                <span className="text-[10px] font-normal text-slate-400">Total {items.length} item</span>
                              </div>
                              <ul className="max-h-60 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                                {items.map((item, idx) => (
                                  <li key={idx} className="flex gap-2 items-start text-[11px] leading-relaxed">
                                    <span className="text-rose-500 font-bold mt-0.5">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                              {/* Arrow pointing down */}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950/95" />
                            </div>
                          )}
                        </div>
                      );
                    })()}
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
