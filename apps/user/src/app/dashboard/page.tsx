import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/modules/auth/components/logout-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@wo/ui-components";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <Card className="w-full max-w-lg border border-white/20 bg-white/80 p-4 shadow-2xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Dashboard Client
            </CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-400">
              Wedding Organizer Platform
            </CardDescription>
          </div>
          <LogoutButton />
        </CardHeader>
        <CardContent className="mt-4 space-y-4">
          <div className="rounded-lg bg-pink-50/50 p-4 border border-pink-100 dark:bg-pink-950/20 dark:border-pink-900/50">
            <h3 className="font-semibold text-pink-800 dark:text-pink-300">
              Halo, {session.user?.name || "Client"}!
            </h3>
            <p className="text-sm text-pink-600 dark:text-pink-400 mt-1">
              Akun Anda telah berhasil diverifikasi dan terhubung ke platform.
            </p>
          </div>

          <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Informasi Akun
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-500">Email:</span>
              <span>{session.user?.email}</span>

              <span className="font-medium text-zinc-500">ID User:</span>
              <span className="font-mono text-xs">{session.user?.id}</span>

              <span className="font-medium text-zinc-500">Role:</span>
              <span className="inline-flex max-w-fit items-center rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-medium text-pink-800 dark:bg-pink-950/50 dark:text-pink-400">
                {session.user?.role}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
