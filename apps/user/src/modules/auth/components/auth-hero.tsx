export function AuthHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-5 text-center lg:text-left">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-rose-500">{eyebrow}</p>
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          {title}
        </h1>
        <p className="max-w-xl text-base leading-7 text-slate-600">{description}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-4 text-left shadow-sm">
          <p className="text-sm font-medium text-slate-950">Cari vendor</p>
          <p className="mt-1 text-sm text-slate-600">Temukan vendor yang cocok untuk hari spesial Anda.</p>
        </div>
        <div className="rounded-3xl border border-white/70 bg-white/80 p-4 text-left shadow-sm">
          <p className="text-sm font-medium text-slate-950">Kelola booking</p>
          <p className="mt-1 text-sm text-slate-600">Pantau status booking dan pembayaran dari satu dashboard.</p>
        </div>
        <div className="rounded-3xl border border-white/70 bg-white/80 p-4 text-left shadow-sm">
          <p className="text-sm font-medium text-slate-950">Tulis review</p>
          <p className="mt-1 text-sm text-slate-600">Bagikan pengalaman Anda setelah acara selesai.</p>
        </div>
      </div>
    </div>
  );
}
