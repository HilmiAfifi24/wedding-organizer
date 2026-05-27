import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/modules/auth/components/logout-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@wo/ui-components";
import { prisma } from "database";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const vendor = await prisma.vendor.findUnique({
    where: { ownerId: session.user.id },
    include: { category: true },
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-50 via-zinc-50 to-orange-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <Card className="w-full max-w-lg border border-white/20 bg-white/80 p-4 shadow-2xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Dashboard Vendor
            </CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-400">
              Wedding Organizer Platform
            </CardDescription>
          </div>
          <LogoutButton />
        </CardHeader>
        <CardContent className="mt-4 space-y-4">
          <div className="rounded-lg bg-amber-50/50 p-4 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/50">
            <h3 className="font-semibold text-amber-800 dark:text-amber-300">
              Halo, {session.user?.name || "Vendor"}!
            </h3>
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
              Portal Bisnis: <span className="font-bold">{vendor?.name || "Nama Toko"}</span>
            </p>
          </div>

          <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Informasi Bisnis & Akun
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-500">Nama Owner:</span>
              <span>{session.user?.name}</span>

              <span className="font-medium text-zinc-500">Email Owner:</span>
              <span>{session.user?.email}</span>

              <span className="font-medium text-zinc-500">Nama Brand:</span>
              <span>{vendor?.name}</span>

              <span className="font-medium text-zinc-500">Kategori Bisnis:</span>
              <span>
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-400">
                  {vendor?.category?.name || "Belum ditentukan"}
                </span>
              </span>

              <span className="font-medium text-zinc-500">ID Vendor:</span>
              <span className="font-mono text-xs">{vendor?.id}</span>

              <span className="font-medium text-zinc-500">Role:</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {session.user?.role}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
