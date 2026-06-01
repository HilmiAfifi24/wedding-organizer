import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";

import { requireVendorRouteAccess } from "@/modules/auth/services/require-vendor-route-access";
import { VendorShell } from "@/shared/components/vendor-shell";

export default async function VendorRejectedPage() {
  const session = await requireVendorRouteAccess("rejected");

  return (
    <VendorShell
      session={session}
      title="Akun Vendor Ditolak"
      description="Admin menolak onboarding vendor saat ini. Perbaiki data yang dibutuhkan lalu kirim ulang untuk review."
    >
      <Card className="border border-amber-500/20 bg-amber-500/10 text-amber-50">
        <CardHeader>
          <CardTitle>Status Rejected</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            {session.rejectionReason ||
              "Vendor membutuhkan revisi data onboarding sebelum dapat disetujui."}
          </p>
          <p>
            Rejected at:{" "}
            {session.rejectedAt ? session.rejectedAt.toLocaleString("id-ID") : "-"}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/profile">Edit Profile & Resubmit</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Kembali ke Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </VendorShell>
  );
}
