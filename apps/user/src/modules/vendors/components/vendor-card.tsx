import Link from "next/link";
import { Button, Card, CardContent } from "@wo/ui-components";

import type { PublicVendorListItemDTO } from "../types";
import { USER_AUTH_ROUTES } from "@/modules/auth/constants/routes";
import { formatPrice } from "../constants";
import { VendorRating } from "./vendor-rating";

export function VendorCard({ vendor }: { vendor: PublicVendorListItemDTO }) {
  return (
    <Card className="overflow-hidden rounded-[28px] border-white/80 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="relative h-56 bg-[linear-gradient(135deg,_rgba(251,113,133,0.18),_rgba(251,191,36,0.16))]">
        {vendor.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vendor.coverImageUrl}
            alt={vendor.businessName}
            className="h-full w-full object-cover"
          />
        ) : vendor.logoUrl ? (
          <div className="flex h-full items-center justify-center p-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={vendor.logoUrl} alt={vendor.businessName} className="max-h-28 object-contain" />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-center text-sm font-medium text-slate-500">
            Preview vendor belum tersedia
          </div>
        )}
      </div>

      <CardContent className="space-y-4 py-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-rose-500">
            <span>{vendor.categoryName || "Vendor"}</span>
            <span className="text-slate-300">•</span>
            <span>{vendor.city || "Indonesia"}</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            {vendor.businessName}
          </h2>
          <p className="text-sm leading-6 text-slate-600">{vendor.shortDescription}</p>
        </div>

        <VendorRating rating={vendor.averageRating} totalReviews={vendor.totalReviews} />

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-3xl border border-slate-100 bg-slate-50/90 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Starting Price</p>
            <p className="mt-2 font-semibold text-slate-950">{formatPrice(vendor.startingPrice)}</p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-slate-50/90 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Bookings</p>
            <p className="mt-2 font-semibold text-slate-950">{vendor.bookingCount}</p>
          </div>
        </div>

        <Button asChild className="h-11 w-full rounded-2xl bg-rose-600 text-white hover:bg-rose-700">
          <Link href={`${USER_AUTH_ROUTES.vendors}/${vendor.id}`}>View Detail</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
