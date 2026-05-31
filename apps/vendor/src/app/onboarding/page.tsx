import { createVendorAuthUseCases } from "@/core/infrastructure/http/vendor-auth-factory";
import { OnboardingForm } from "@/modules/auth/components/onboarding-form";
import { requireVendorRouteAccess } from "@/modules/auth/services/require-vendor-route-access";
import { VendorShell } from "@/shared/components/vendor-shell";

export default async function OnboardingPage() {
  const session = await requireVendorRouteAccess("onboarding");
  const { getVendorOnboardingUseCase, listVendorCategoriesUseCase } = createVendorAuthUseCases();
  const [onboarding, categories] = await Promise.all([
    getVendorOnboardingUseCase.execute(session.userId),
    listVendorCategoriesUseCase.execute(),
  ]);

  return (
    <VendorShell
      session={session}
      title="Vendor Onboarding"
      description="Lengkapi identitas bisnis, kontak, dan alamat agar vendor siap direview admin. Approval hanya bisa diberikan jika checklist verifikasi terpenuhi."
    >
      <OnboardingForm initialData={onboarding} categories={categories} />
    </VendorShell>
  );
}
