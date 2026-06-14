"use client";

import { Button, Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";

export default function VendorDetailError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.16),_transparent_26%),linear-gradient(160deg,_#fff7ed_0%,_#fff1f2_48%,_#ffffff_100%)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Card className="rounded-[28px] border-white/80 bg-white/88 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle className="text-3xl text-slate-950">Vendor detail gagal dimuat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <p>{error.message || "Terjadi kesalahan saat memuat detail vendor."}</p>
            <Button onClick={reset} className="rounded-full bg-rose-600 text-white hover:bg-rose-700">
              Coba lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
