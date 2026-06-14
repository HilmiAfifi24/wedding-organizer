export function VendorDetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white/88">
          <div className="h-72 animate-pulse bg-slate-100" />
          <div className="space-y-4 p-6">
            <div className="h-3 w-28 animate-pulse rounded-full bg-slate-100" />
            <div className="h-10 w-3/4 animate-pulse rounded-full bg-slate-100" />
            <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
        <div className="rounded-[28px] border border-white/80 bg-white/88 p-6">
          <div className="h-8 w-48 animate-pulse rounded-full bg-slate-100" />
          <div className="mt-4 space-y-3">
            <div className="h-24 animate-pulse rounded-3xl bg-slate-100" />
            <div className="h-24 animate-pulse rounded-3xl bg-slate-100" />
            <div className="h-32 animate-pulse rounded-3xl bg-slate-100" />
          </div>
        </div>
      </div>
      <div className="rounded-[28px] border border-white/80 bg-white/88 p-6">
        <div className="h-8 w-40 animate-pulse rounded-full bg-slate-100" />
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-3xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
