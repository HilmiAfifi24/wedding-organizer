import { requireVendorRouteAccess } from "@/modules/auth/services/require-vendor-route-access";
import { VendorModulePlaceholder } from "@/shared/components/vendor-module-placeholder";
import { VendorShell } from "@/shared/components/vendor-shell";

export default async function VendorServicesPage() {
  const session = await requireVendorRouteAccess("protected");

  return (
    <VendorShell
      session={session}
      title="Layanan Vendor"
      description="Area ini akan menjadi tempat vendor menambahkan, mengubah, dan menonaktifkan service yang bisa dipesan user."
    >
      <VendorModulePlaceholder
        title="Modul Services Menunggu Implementasi Lanjutan"
        description="Route protection dan vendor shell sudah aktif. Saat modul services dikembangkan nanti, vendor approved bisa langsung bekerja di halaman ini tanpa mengubah fondasi auth."
      />
    </VendorShell>
  );
}
