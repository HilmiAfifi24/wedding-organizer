"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogoutButton } from "@/modules/auth/components/logout-button";
import type { SidebarNavigationItem } from "@/shared/lib/sidebar-navigation";

interface AdminLayoutProps {
  children: React.ReactNode;
  navigation: SidebarNavigationItem[];
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

const isActivePath = (pathname: string, path: string | null) => {
  if (!path) return false;
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
};

const collectNavigationPaths = (items: SidebarNavigationItem[]) => {
  const paths = new Set<string>();

  const walk = (nodes: SidebarNavigationItem[]) => {
    for (const node of nodes) {
      if (node.path) {
        paths.add(node.path);
      }
      if (node.children.length > 0) {
        walk(node.children);
      }
    }
  };

  walk(items);
  return Array.from(paths);
};

const NavigationNode = ({
  item,
  pathname,
  depth,
  onNavigate,
}: {
  item: SidebarNavigationItem;
  pathname: string;
  depth: number;
  onNavigate: () => void;
}) => {
  const active = isActivePath(pathname, item.path);

  return (
    <div className="space-y-1">
      {item.path ? (
        <Link
          href={item.path}
          onClick={onNavigate}
          className={`flex items-center rounded-lg px-3 py-2 text-sm transition ${
            active
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground"
          }`}
          style={{ paddingLeft: `${12 + depth * 12}px` }}
        >
          {item.title}
        </Link>
      ) : (
        <p
          className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground/80"
          style={{ paddingLeft: `${12 + depth * 12}px` }}
        >
          {item.title}
        </p>
      )}

      {item.children.length > 0 && (
        <div className="space-y-1">
          {item.children.map((child) => (
            <NavigationNode
              key={child.id}
              item={child}
              pathname={pathname}
              depth={depth + 1}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function AdminLayout({ children, user, navigation }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const prefetchPaths = useMemo(() => collectNavigationPaths(navigation), [navigation]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      for (const path of prefetchPaths) {
        router.prefetch(path);
      }
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [prefetchPaths, router]);

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,#172554_0%,#020617_48%,#020617_100%)] text-slate-100">
      <div className="fixed left-4 top-4 z-40 lg:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg border border-border bg-card p-2 text-muted-foreground backdrop-blur-md hover:text-foreground"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      </div>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-35 flex w-72 flex-col border-r border-border bg-card px-6 py-6 backdrop-blur-md transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <svg
              className="h-6 w-6 text-primary-foreground"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight text-foreground">WO Platform</h1>
            <p className="text-xs font-semibold text-primary">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
          {navigation.length === 0 ? (
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-3 text-xs text-slate-400">
              Tidak ada menu yang dapat diakses.
            </div>
          ) : (
            navigation.map((item) => (
              <NavigationNode
                key={item.id}
                item={item}
                pathname={pathname}
                depth={0}
                onNavigate={() => setSidebarOpen(false)}
              />
            ))
          )}
        </nav>

        {user && (
          <div className="mt-auto border-t border-slate-800 pt-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted font-bold text-primary">
                {user.name ? user.name[0]?.toUpperCase() : "A"}
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-sm font-semibold text-foreground">
                  {user.name || "Administrator"}
                </p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        )}
      </aside>

      <main className="min-h-screen flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">{children}</div>
      </main>
    </div>
  );
}
