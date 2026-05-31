import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";

import { requireVendorRouteAccess } from "@/modules/auth/services/require-vendor-route-access";

export default async function ForgotPasswordPage() {
  await requireVendorRouteAccess("auth");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#164e63_0%,#020617_58%,#020617_100%)] px-4 py-10">
      <Card className="w-full max-w-lg border-white/10 bg-slate-950/75 text-slate-100 backdrop-blur">
        <CardHeader>
          <CardTitle>Lupa Password Vendor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-300">
          <p>
            Modul reset password vendor belum diaktifkan. Untuk sementara, proses reset bisa
            dibantu oleh admin platform.
          </p>
          <Button asChild>
            <Link href="/login">Kembali ke Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
