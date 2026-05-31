import { requireVendorRouteAccess } from "@/modules/auth/services/require-vendor-route-access";
import { VendorModulePlaceholder } from "@/shared/components/vendor-module-placeholder";
import { VendorShell } from "@/shared/components/vendor-shell";

export default async function VendorPaymentsPage() {
  const session = await requireVendorRouteAccess("protected");

  return (
    <VendorShell
      session={session}
      title="Pembayaran Vendor"
      description="Vendor approved akan memonitor payment proof booking dan melakukan verifikasi sesuai alur pembayaran offline."
    >
      <VendorModulePlaceholder
        title="Pembayaran Vendor Menunggu Modul Operasional"
        description="Alur login vendor dan proteksi status sudah siap. Tahap berikutnya tinggal menambahkan monitoring payment proof khusus vendor."
      />
    </VendorShell>
  );
}
