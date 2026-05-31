import { Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";

import { requireVendorRouteAccess } from "@/modules/auth/services/require-vendor-route-access";
import { VendorShell } from "@/shared/components/vendor-shell";

export default async function DashboardPage() {
  const session = await requireVendorRouteAccess("protected");

  return (
    <VendorShell
      session={session}
      title="Dashboard Vendor"
      description="Ringkasan operasional vendor untuk memantau status akun, kesiapan onboarding, dan modul bisnis yang tersedia."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border border-white/10 bg-slate-950/65 text-slate-100">
          <CardHeader>
            <CardTitle>Status Akun</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            Vendor Anda sudah berstatus <span className="font-semibold text-emerald-300">approved</span>.
          </CardContent>
        </Card>
        <Card className="border border-white/10 bg-slate-950/65 text-slate-100">
          <CardHeader>
            <CardTitle>Business Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p>Owner: {session.ownerName || "-"}</p>
            <p>Business: {session.businessName || "-"}</p>
            <p>Email: {session.email}</p>
          </CardContent>
        </Card>
        <Card className="border border-white/10 bg-slate-950/65 text-slate-100">
          <CardHeader>
            <CardTitle>Next Focus</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            Lengkapi modul `services` dan `portfolio` agar marketplace vendor lebih siap menerima booking.
          </CardContent>
        </Card>
      </div>
    </VendorShell>
  );
}
