import Link from "next/link";
import { type UserSessionDTO } from "@wo/shared-types";
import { Button } from "@wo/ui-components";

import { USER_AUTH_ROUTES } from "@/modules/auth/constants/routes";
import { LogoutButton } from "@/modules/auth/components/logout-button";

export function PublicSiteShell({
  session,
  children,
}: {
  session: UserSessionDTO | null;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#172554_0%,#020617_48%,#020617_100%)] text-slate-100">
      <div className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[28px] border border-white/10 bg-card p-5 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <Link href={USER_AUTH_ROUTES.home} className="inline-flex items-center gap-2">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-600 text-sm font-semibold text-white animate-pulse">
                  WO
                </span>
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.28em] text-rose-400">
                    Wedding Organizer
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight text-white">
                    Vendor Discovery
                  </h1>
                </div>
              </Link>
              <nav className="flex flex-wrap gap-2 text-sm text-slate-300">
                <Link href={USER_AUTH_ROUTES.home} className="rounded-full px-3 py-2 hover:bg-white/5 hover:text-white transition-all">
                  Home
                </Link>
                <Link href={USER_AUTH_ROUTES.vendors} className="rounded-full px-3 py-2 hover:bg-white/5 hover:text-white transition-all">
                  Vendors
                </Link>
                {session ? (
                  <Link href={USER_AUTH_ROUTES.dashboard} className="rounded-full px-3 py-2 hover:bg-white/5 hover:text-white transition-all">
                    Dashboard
                  </Link>
                ) : null}
              </nav>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {session ? (
                <>
                  <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white">
                    <p className="text-sm font-medium">{session.fullName || "Wedding Customer"}</p>
                    <p className="text-xs text-slate-400">{session.email}</p>
                  </div>
                  <LogoutButton className="border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10" />
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="rounded-full border-white/10 hover:bg-white/5">
                    <Link href={USER_AUTH_ROUTES.login}>Login</Link>
                  </Button>
                  <Button asChild className="rounded-full bg-rose-600 text-white hover:bg-rose-700">
                    <Link href={USER_AUTH_ROUTES.register}>Register</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="py-6">{children}</main>
      </div>
    </div>
  );
}
