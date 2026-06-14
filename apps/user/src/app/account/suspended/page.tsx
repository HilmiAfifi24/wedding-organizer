import { Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";

import { requireUserRouteAccess } from "@/modules/auth/services/require-user-route-access";
import { UserShell } from "@/shared/components/user-shell";

export default async function UserSuspendedPage() {
  const session = await requireUserRouteAccess("suspended");

  return (
    <UserShell
      session={session}
      title="Akun Disuspend"
      description="Akses customer Anda dihentikan sementara. Hubungi tim admin jika Anda memerlukan bantuan lebih lanjut."
    >
      <Card className="rounded-[28px] border-rose-200 bg-rose-50 shadow-[0_24px_70px_rgba(190,24,93,0.08)]">
        <CardHeader>
          <CardTitle className="text-2xl text-rose-900">Status Akun Suspended</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-6 text-rose-800">
          <p>
            Akun customer Anda sedang dinonaktifkan sementara sehingga modul dashboard, booking, pembayaran, review, dan profile tidak bisa digunakan.
          </p>
          <p>
            Suspended at: {session.suspendedAt ? session.suspendedAt.toLocaleString("id-ID") : "-"}
          </p>
          <p>
            Bila Anda merasa ini tidak sesuai, silakan hubungi admin platform untuk proses peninjauan ulang.
          </p>
        </CardContent>
      </Card>
    </UserShell>
  );
}
