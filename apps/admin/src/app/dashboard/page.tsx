import React from "react";
import { getEffectiveNavigationForUser } from "@/modules/access-control/services/get-effective-navigation";
import { requireAdminSession } from "@/modules/auth/services/require-admin-session";
import { AdminLayout } from "@/shared/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@wo/ui-components";

export default async function DashboardPage() {
  const session = await requireAdminSession();
  const navigation = await getEffectiveNavigationForUser(session.user.id);

  return (
    <AdminLayout user={session.user} navigation={navigation}>
      <div className="flex justify-center items-center py-12">
        <Card className="w-full max-w-lg border border-slate-800 bg-slate-900/40 p-4 shadow-2xl backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-100">
                Admin Command Console
              </CardTitle>
              <CardDescription className="text-slate-400">
                Wedding Organizer Control Room
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="mt-4 space-y-4">
            <div className="rounded-lg bg-indigo-950/30 p-4 border border-indigo-900/50">
              <h3 className="font-semibold text-indigo-400">
                Sistem Aktif & Terlindungi
              </h3>
              <p className="text-sm text-indigo-300 mt-1">
                Otentikasi Administrator Berhasil. Selamat bertugas, {session.user?.name || "Admin"}!
              </p>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">
                Status Sesi Admin
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                <span className="font-medium text-slate-500">Email:</span>
                <span className="truncate">{session.user?.email}</span>

                <span className="font-medium text-slate-500">ID Admin:</span>
                <span className="font-mono text-xs text-indigo-300 truncate">{session.user?.id}</span>

                <span className="font-medium text-slate-500">Role:</span>
                <span className="inline-flex max-w-fit items-center rounded-full bg-indigo-900/50 px-2.5 py-0.5 text-xs font-medium text-indigo-300 border border-indigo-800/50">
                  {session.user?.role}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
