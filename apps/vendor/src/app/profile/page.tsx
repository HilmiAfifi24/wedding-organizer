import { createVendorProfileUseCases } from "@/core/infrastructure/http/profile/vendor-profile-factory";
import { ProfileManager } from "@/modules/profile/components/profile-manager";
import { requireVendorRouteAccess } from "@/modules/auth/services/require-vendor-route-access";
import { VendorShell } from "@/shared/components/vendor-shell";

export default async function VendorProfilePage() {
  const session = await requireVendorRouteAccess("workspace");
  const { getVendorProfileUseCase, listVendorProfileCategoriesUseCase } = createVendorProfileUseCases();
  const [profile, categories] = await Promise.all([
    getVendorProfileUseCase.execute(session.userId),
    listVendorProfileCategoriesUseCase.execute(),
  ]);

  return (
    <VendorShell
      session={session}
      title="Profil Vendor"
      description="Kelola identitas bisnis vendor, kontak utama, dan informasi yang akan ditampilkan pada marketplace setelah vendor disetujui."
    >
      <ProfileManager initialProfile={profile} categories={categories} />
    </VendorShell>
  );
}
