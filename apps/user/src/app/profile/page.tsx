import { Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";

import { requireUserRouteAccess } from "@/modules/auth/services/require-user-route-access";
import { UserShell } from "@/shared/components/user-shell";

export default async function ProfilePage() {
  const session = await requireUserRouteAccess("protected");

  return (
    <UserShell
      session={session}
      title="Profil Akun"
      description="Informasi dasar akun customer yang tersimpan di session dan siap dipakai modul profile berikutnya."
    >
      <Card className="rounded-[28px] border-white/80 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-950">Detail Profil</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Nama Lengkap</p>
            <p className="mt-2 font-medium text-slate-950">{session.fullName || "-"}</p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</p>
            <p className="mt-2 font-medium text-slate-950">{session.email}</p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Phone Number</p>
            <p className="mt-2 font-medium text-slate-950">{session.phoneNumber || "-"}</p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</p>
            <p className="mt-2 font-medium text-slate-950">{session.status}</p>
          </div>
        </CardContent>
      </Card>
    </UserShell>
  );
}
