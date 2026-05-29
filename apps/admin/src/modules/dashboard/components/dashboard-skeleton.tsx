export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="h-8 w-56 animate-pulse rounded bg-slate-800" />
        <div className="h-4 w-80 animate-pulse rounded bg-slate-900" />
      </div>
      <div className="h-10 w-44 animate-pulse rounded bg-slate-900" />
    </div>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="h-32 animate-pulse rounded-xl border border-slate-800 bg-slate-900/50" />
      ))}
    </div>

    <div className="grid gap-4 xl:grid-cols-2">
      <div className="h-[420px] animate-pulse rounded-xl border border-slate-800 bg-slate-900/50" />
      <div className="h-[420px] animate-pulse rounded-xl border border-slate-800 bg-slate-900/50" />
    </div>

    <div className="grid gap-4 xl:grid-cols-2">
      <div className="h-[420px] animate-pulse rounded-xl border border-slate-800 bg-slate-900/50" />
      <div className="h-[420px] animate-pulse rounded-xl border border-slate-800 bg-slate-900/50" />
    </div>
  </div>
);
