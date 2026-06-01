import { createVendorProfileUseCases } from "@/core/infrastructure/http/profile/vendor-profile-factory";
import { requireVendorRouteAccess } from "@/modules/auth/services/require-vendor-route-access";
import { ProfileManager } from "@/modules/profile/components/profile-manager";
import { VendorShell } from "@/shared/components/vendor-shell";

export default async function OnboardingPage() {
  const session = await requireVendorRouteAccess("onboarding");
  const { getVendorProfileUseCase, listVendorProfileCategoriesUseCase } =
    createVendorProfileUseCases();
  const [profile, categories] = await Promise.all([
    getVendorProfileUseCase.execute(session.userId),
    listVendorProfileCategoriesUseCase.execute(),
  ]);

  return (
    <VendorShell
      session={session}
      title="Vendor Onboarding"
      description="Lengkapi data profil vendor, media bisnis, dan checklist verifikasi agar siap direview admin."
    >
      <ProfileManager initialProfile={profile} categories={categories} />
    </VendorShell>
  );
}
