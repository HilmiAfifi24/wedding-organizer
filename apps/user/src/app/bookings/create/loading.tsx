export default function CreateBookingLoading() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,168,212,0.22),_transparent_32%),linear-gradient(160deg,_#fff7ed_0%,_#fff1f2_48%,_#ffffff_100%)] px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="h-64 animate-pulse rounded-[28px] bg-white/80" />
          <div className="h-64 animate-pulse rounded-[28px] bg-white/80" />
        </div>
        <div className="h-[720px] animate-pulse rounded-[28px] bg-white/80" />
      </div>
    </div>
  );
}
