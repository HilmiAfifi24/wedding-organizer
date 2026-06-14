import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@wo/ui-components";

import { USER_AUTH_ROUTES } from "@/modules/auth/constants/routes";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(160deg,_#0f172a_0%,_#111827_48%,_#1f2937_100%)] px-4 py-10 text-white">
      <Card className="w-full max-w-lg rounded-[32px] border-white/10 bg-white/8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur">
        <CardHeader className="space-y-3">
          <CardTitle className="text-3xl">Akses Tidak Diizinkan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-sm leading-7 text-slate-200">
          <p>
            Portal ini hanya dapat diakses oleh akun dengan role <strong>USER</strong>. Akun ADMIN dan VENDOR akan diblokir dari User App.
          </p>
          <Button asChild className="h-11 rounded-full bg-white text-slate-950 hover:bg-slate-100">
            <Link href={USER_AUTH_ROUTES.login}>Kembali ke Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
