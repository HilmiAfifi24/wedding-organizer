import Link from "next/link";
import { type UserSessionDTO } from "@wo/shared-types";
import { Badge, Button } from "@wo/ui-components";

import { USER_AUTH_ROUTES } from "@/modules/auth/constants/routes";
import { LogoutButton } from "@/modules/auth/components/logout-button";

const navigationItems = [
  { href: USER_AUTH_ROUTES.vendors, label: "Vendors" },
  { href: USER_AUTH_ROUTES.dashboard, label: "Dashboard" },
  { href: USER_AUTH_ROUTES.bookings, label: "Bookings" },
  { href: USER_AUTH_ROUTES.payments, label: "Payments" },
  { href: USER_AUTH_ROUTES.reviews, label: "Reviews" },
  { href: USER_AUTH_ROUTES.profile, label: "Profile" },
];

export function UserShell({
  session,
  title,
  description,
  children,
}: {
  session: UserSessionDTO;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,168,212,0.22),_transparent_32%),linear-gradient(160deg,_#fff7ed_0%,_#fff1f2_48%,_#ffffff_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(190,24,93,0.08)] backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <Link href={USER_AUTH_ROUTES.home} className="inline-flex items-center gap-2">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-600 text-sm font-semibold text-white">
                  WO
                </span>
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.28em] text-rose-500">
                    Wedding Organizer
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                    {title}
                  </h1>
                </div>
              </Link>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
            </div>

            <div className="flex flex-col gap-3 rounded-3xl bg-slate-950 px-4 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">{session.fullName || "Wedding Customer"}</p>
                <p className="text-xs text-slate-300">{session.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="border-0 bg-white/12 text-white">USER</Badge>
                <LogoutButton />
              </div>
            </div>
          </div>

          <nav className="mt-5 flex flex-wrap gap-2">
            {navigationItems.map((item) => (
              <Button key={item.href} asChild variant="ghost" className="rounded-full text-slate-700">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </nav>
        </header>

        <main className="flex-1 py-6">{children}</main>
      </div>
    </div>
  );
}
