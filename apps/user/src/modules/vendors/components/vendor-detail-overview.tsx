import { Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";

import type { PublicVendorDetailDTO } from "../types";
import { VendorRating } from "./vendor-rating";
import { formatPrice } from "../constants";

export function VendorDetailOverview({ vendor }: { vendor: PublicVendorDetailDTO }) {
  const contactEntries = [
    vendor.contact.contactInfo ? { label: "Contact", value: vendor.contact.contactInfo } : null,
    vendor.contact.phoneNumber ? { label: "Phone", value: vendor.contact.phoneNumber } : null,
    vendor.contact.whatsappNumber
      ? { label: "WhatsApp", value: vendor.contact.whatsappNumber }
      : null,
    vendor.contact.website ? { label: "Website", value: vendor.contact.website } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="overflow-hidden rounded-[28px] border-white/80 bg-white/88 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="relative h-72 bg-[linear-gradient(135deg,_rgba(251,113,133,0.18),_rgba(251,191,36,0.16))]">
          {vendor.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vendor.coverImageUrl} alt={vendor.businessName} className="h-full w-full object-cover" />
          ) : vendor.logoUrl ? (
            <div className="flex h-full items-center justify-center p-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={vendor.logoUrl} alt={vendor.businessName} className="max-h-32 object-contain" />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">
              Preview vendor belum tersedia
            </div>
          )}
        </div>
        <CardContent className="space-y-5 py-6">
          <div className="space-y-2">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-rose-500">
              {vendor.categoryName || "Vendor"}
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
              {vendor.businessName}
            </h1>
            <p className="text-sm leading-7 text-slate-600">
              {vendor.description || "Vendor ini belum menambahkan deskripsi publik."}
            </p>
          </div>

          <VendorRating rating={vendor.averageRating} totalReviews={vendor.totalReviews} />

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-100 bg-slate-50/90 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Starting Price</p>
              <p className="mt-2 font-semibold text-slate-950">{formatPrice(vendor.startingPrice)}</p>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-slate-50/90 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">City</p>
              <p className="mt-2 font-semibold text-slate-950">{vendor.city || "-"}</p>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-slate-50/90 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Bookings</p>
              <p className="mt-2 font-semibold text-slate-950">{vendor.bookingCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-white/80 bg-white/88 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-950">Business Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-sm text-slate-700">
          <div className="rounded-3xl border border-slate-100 bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Address</p>
            <p className="mt-2 leading-6 text-slate-700">
              {[vendor.businessAddress, vendor.city, vendor.province].filter(Boolean).join(", ") || "-"}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Price Range</p>
            <p className="mt-2 leading-6 text-slate-700">{vendor.priceRange || "Berdasarkan paket aktif vendor"}</p>
          </div>

          <div className="space-y-3 rounded-3xl border border-slate-100 bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Contact Info</p>
            {contactEntries.length ? (
              contactEntries.map((entry) => (
                <div key={entry.label}>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    {entry.label}
                  </p>
                  <p className="mt-1 leading-6 text-slate-700">{entry.value}</p>
                </div>
              ))
            ) : (
              <p className="leading-6 text-slate-700">Kontak vendor belum dibuka untuk publik.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
