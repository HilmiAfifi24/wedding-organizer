import Link from "next/link";
import { UserStatus } from "@wo/shared-types";
import { Button, Card, CardContent } from "@wo/ui-components";
import { redirect } from "next/navigation";

import { getCurrentUserSession } from "@/modules/auth/services/current-user-session";
import { USER_AUTH_ROUTES } from "@/modules/auth/constants/routes";

export default async function Home() {
  const session = await getCurrentUserSession();

  if (session?.status === UserStatus.SUSPENDED) {
    redirect(USER_AUTH_ROUTES.suspended);
  }

  if (session?.status === UserStatus.ACTIVE) {
    redirect(USER_AUTH_ROUTES.dashboard);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.18),_transparent_26%),linear-gradient(160deg,_#fff7ed_0%,_#fff1f2_48%,_#ffffff_100%)]">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-8 px-4 py-10 lg:px-8">
        <div className="space-y-5">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-rose-500">
            Wedding Organizer User App
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
            Cari vendor, kelola booking, dan pantau pembayaran pernikahan Anda dalam satu alur.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Portal customer ini dirancang untuk membantu Anda bergerak cepat dari tahap eksplorasi vendor hingga review pasca acara.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline" className="h-11 rounded-full border-slate-300 px-6">
            <Link href={USER_AUTH_ROUTES.vendors}>Lihat vendor approved</Link>
          </Button>
          <Button asChild className="h-11 rounded-full bg-rose-600 px-6 text-white hover:bg-rose-700">
            <Link href={USER_AUTH_ROUTES.register}>Mulai sebagai customer</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full border-slate-300 px-6">
            <Link href={USER_AUTH_ROUTES.login}>Saya sudah punya akun</Link>
          </Button>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-[28px] border-white/80 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
            <CardContent className="space-y-2 py-6">
              <h2 className="text-lg font-semibold text-slate-950">Temukan vendor</h2>
              <p className="text-sm leading-6 text-slate-600">
                Jelajahi layanan vendor favorit dengan pengalaman browsing yang lebih tertata.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-[28px] border-white/80 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
            <CardContent className="space-y-2 py-6">
              <h2 className="text-lg font-semibold text-slate-950">Pantau booking</h2>
              <p className="text-sm leading-6 text-slate-600">
                Setiap booking, pembayaran, dan pembaruan status tercatat jelas dalam akun Anda.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-[28px] border-white/80 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
            <CardContent className="space-y-2 py-6">
              <h2 className="text-lg font-semibold text-slate-950">Tinggalkan review</h2>
              <p className="text-sm leading-6 text-slate-600">
                Setelah acara selesai, Anda bisa membantu calon pasangan lain lewat review yang jujur.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
