export function VendorsSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[28px] border border-white/80 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)]"
        >
          <div className="h-56 animate-pulse bg-slate-100" />
          <div className="space-y-4 p-6">
            <div className="space-y-3">
              <div className="h-3 w-28 animate-pulse rounded-full bg-slate-100" />
              <div className="h-8 w-3/4 animate-pulse rounded-full bg-slate-100" />
              <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-100" />
            </div>
            <div className="h-4 w-40 animate-pulse rounded-full bg-slate-100" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-20 animate-pulse rounded-3xl bg-slate-100" />
              <div className="h-20 animate-pulse rounded-3xl bg-slate-100" />
            </div>
            <div className="h-11 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
