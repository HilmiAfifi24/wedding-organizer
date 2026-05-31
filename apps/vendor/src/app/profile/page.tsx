import { requireVendorRouteAccess } from "@/modules/auth/services/require-vendor-route-access";
import { VendorModulePlaceholder } from "@/shared/components/vendor-module-placeholder";
import { VendorShell } from "@/shared/components/vendor-shell";

export default async function VendorProfilePage() {
  const session = await requireVendorRouteAccess("protected");

  return (
    <VendorShell
      session={session}
      title="Profil Vendor"
      description="Kelola identitas bisnis vendor, kontak utama, dan informasi yang akan ditampilkan pada marketplace setelah vendor disetujui."
    >
      <VendorModulePlaceholder
        title="Profil Vendor Siap Dilanjutkan"
        description="Fondasi registrasi dan onboarding vendor sudah aktif. Modul profile berikutnya bisa melanjutkan pengelolaan identitas bisnis dengan aman di atas session dan route protection yang sudah terpasang."
        ctaHref="/onboarding"
        ctaLabel="Lihat Onboarding"
      />
    </VendorShell>
  );
}
