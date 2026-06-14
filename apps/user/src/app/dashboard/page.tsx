import { Badge, Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";

import { requireUserRouteAccess } from "@/modules/auth/services/require-user-route-access";
import { UserShell } from "@/shared/components/user-shell";

export default async function DashboardPage() {
  const session = await requireUserRouteAccess("protected");

  return (
    <UserShell
      session={session}
      title="Dashboard Pengguna"
      description="Ringkasan cepat akun customer Anda untuk memantau booking aktif, status pembayaran, dan langkah berikutnya."
    >
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[28px] border-white/80 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <CardHeader className="space-y-3">
            <Badge className="w-fit border-0 bg-rose-100 text-rose-700">Session Ready</Badge>
            <CardTitle className="text-3xl tracking-tight text-slate-950">
              Halo, {session.fullName || "Wedding Customer"}.
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-slate-600">
            <p>
              Akun Anda aktif dan siap dipakai untuk mencari vendor, membuat booking, mengunggah payment proof, dan menulis review setelah acara selesai.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Role</p>
                <p className="mt-2 font-semibold text-slate-950">{session.role}</p>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</p>
                <p className="mt-2 font-semibold text-slate-950">{session.status}</p>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Phone</p>
                <p className="mt-2 font-semibold text-slate-950">{session.phoneNumber || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-slate-950 bg-slate-950 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
          <CardHeader>
            <CardTitle className="text-xl">Informasi Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-200">
            <p>Email: {session.email}</p>
            <p>User ID: {session.userId}</p>
            <p>Nama Lengkap: {session.fullName || "-"}</p>
            <p>Session ini hanya berlaku untuk role USER yang aktif.</p>
          </CardContent>
        </Card>
      </div>
    </UserShell>
  );
}
