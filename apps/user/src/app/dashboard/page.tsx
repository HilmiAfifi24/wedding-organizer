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
        <Card className="rounded-[28px] border-white/10 bg-card shadow-2xl">
          <CardHeader className="space-y-3">
            <Badge className="w-fit bg-rose-500/10 text-rose-400 border border-rose-500/20">Session Ready</Badge>
            <CardTitle className="text-3xl tracking-tight text-white">
              Halo, {session.fullName || "Wedding Customer"}.
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-slate-300">
            <p>
              Akun Anda aktif dan siap dipakai untuk mencari vendor, membuat booking, mengunggah payment proof, dan menulis review setelah acara selesai.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Role</p>
                <p className="mt-2 font-semibold text-white">{session.role}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</p>
                <p className="mt-2 font-semibold text-white">{session.status}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Phone</p>
                <p className="mt-2 font-semibold text-white">{session.phoneNumber || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-white/10 bg-card shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl text-white">Informasi Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
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
