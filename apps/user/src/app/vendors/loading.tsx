import { VendorsSkeleton } from "@/modules/vendors/components/vendors-skeleton";

export default function VendorsLoading() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.16),_transparent_26%),linear-gradient(160deg,_#fff7ed_0%,_#fff1f2_48%,_#ffffff_100%)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[28px] border border-white/80 bg-white/88 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div className="h-4 w-36 animate-pulse rounded-full bg-slate-100" />
          <div className="mt-4 h-12 w-2/3 animate-pulse rounded-full bg-slate-100" />
          <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-slate-100" />
        </div>
        <div className="rounded-[28px] border border-white/80 bg-white/88 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div className="grid gap-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-11 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        </div>
        <VendorsSkeleton />
      </div>
    </div>
  );
}
