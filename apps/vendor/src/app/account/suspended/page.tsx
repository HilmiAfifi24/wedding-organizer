import { Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";

import { requireVendorRouteAccess } from "@/modules/auth/services/require-vendor-route-access";
import { VendorShell } from "@/shared/components/vendor-shell";

export default async function VendorSuspendedPage() {
  const session = await requireVendorRouteAccess("suspended");

  return (
    <VendorShell
      session={session}
      title="Akun Vendor Disuspend"
      description="Akses dashboard vendor dihentikan sementara oleh admin. Hubungi tim admin jika Anda membutuhkan klarifikasi lebih lanjut."
    >
      <Card className="border border-rose-500/20 bg-rose-500/10 text-rose-50">
        <CardHeader>
          <CardTitle>Status Suspended</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            Akun vendor Anda sedang diblokir sementara sehingga belum bisa menerima booking
            ataupun mengakses modul operasional vendor.
          </p>
          <p>
            Suspended at:{" "}
            {session.suspendedAt ? session.suspendedAt.toLocaleString("id-ID") : "-"}
          </p>
          <p className="text-rose-100/80">
            Jika ini terasa tidak sesuai, silakan hubungi admin platform untuk proses
            peninjauan ulang.
          </p>
        </CardContent>
      </Card>
    </VendorShell>
  );
}
