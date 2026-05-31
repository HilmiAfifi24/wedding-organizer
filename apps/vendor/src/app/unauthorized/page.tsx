import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#3f1d38_0%,#020617_58%,#020617_100%)] px-4 py-10">
      <Card className="w-full max-w-lg border-white/10 bg-slate-950/75 text-slate-100 backdrop-blur">
        <CardHeader>
          <CardTitle>Akses Tidak Diizinkan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-300">
          <p>
            Portal ini hanya untuk akun vendor. Jika Anda masuk dengan role lain, silakan
            gunakan aplikasi yang sesuai.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/login">Masuk sebagai Vendor</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Kembali</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
