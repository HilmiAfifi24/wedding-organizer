import { requireVendorRouteAccess } from "@/modules/auth/services/require-vendor-route-access";
import { VendorModulePlaceholder } from "@/shared/components/vendor-module-placeholder";
import { VendorShell } from "@/shared/components/vendor-shell";

export default async function VendorBookingsPage() {
  const session = await requireVendorRouteAccess("protected");

  return (
    <VendorShell
      session={session}
      title="Booking Vendor"
      description="Vendor approved akan memantau booking masuk, detail user, dan status pekerjaan dari area ini."
    >
      <VendorModulePlaceholder
        title="Booking Workspace Siap Diteruskan"
        description="Semua route booking vendor sekarang sudah terlindungi. Modul booking detail, timeline, dan aksi status bisa dibangun di atas guard ini."
      />
    </VendorShell>
  );
}
