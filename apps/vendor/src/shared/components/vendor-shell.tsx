"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { VendorStatus, type VendorSessionDTO } from "@wo/shared-types";

import { LogoutButton } from "@/modules/auth/components/logout-button";

const approvedNavigationItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/bookings", label: "Bookings" },
  { href: "/payments", label: "Payments" },
];

const onboardingNavigationItems = [
  { href: "/onboarding", label: "Onboarding" },
  { href: "/profile", label: "Profile" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
];

const isActivePath = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

interface VendorShellProps {
  session: VendorSessionDTO;
  title: string;
  description: string;
  children: ReactNode;
}

export function VendorShell({
  session,
  title,
  description,
  children,
}: VendorShellProps) {
  const pathname = usePathname();
  const navigationItems =
    session.vendorStatus === VendorStatus.APPROVED
      ? approvedNavigationItems
      : onboardingNavigationItems;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#172554_0%,#020617_48%,#020617_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6">
        <aside className="w-full shrink-0 rounded-3xl border border-white/10 bg-slate-950/65 p-5 backdrop-blur lg:w-80">
          <div className="flex items-center gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-200">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 21h16.5M4.5 18.75V8.25m15 10.5V8.25M8.25 18.75V5.25h7.5v13.5"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-200/70">
                Vendor App
              </p>
              <h1 className="text-xl font-semibold text-white">
                {session.businessName || "Vendor Portal"}
              </h1>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {navigationItems.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/40"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              Vendor Account
            </p>
            <p className="mt-3 text-base font-semibold text-white">
              {session.ownerName || "Vendor Owner"}
            </p>
            <p className="text-sm text-slate-400">{session.email}</p>
            <p className="mt-2 text-xs font-medium text-amber-300">
              Status: {session.vendorStatus.replaceAll("_", " ")}
            </p>
            <div className="mt-4">
              <LogoutButton />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <section className="rounded-3xl border border-white/10 bg-slate-950/65 p-6 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">
              Wedding Organizer Vendor Workspace
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">{title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
          </section>
          {children}
        </main>
      </div>
    </div>
  );
}
