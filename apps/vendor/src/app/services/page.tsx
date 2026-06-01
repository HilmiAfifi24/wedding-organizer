import { createVendorAssetsUseCases } from "@/core/infrastructure/http/vendor-assets-factory";
import { requireVendorRouteAccess } from "@/modules/auth/services/require-vendor-route-access";
import { ServicesManager } from "@/modules/services/components/services-manager";
import { VendorShell } from "@/shared/components/vendor-shell";

export default async function VendorServicesPage() {
  const session = await requireVendorRouteAccess("workspace");
  const { listVendorServicesUseCase } = createVendorAssetsUseCases();
  const services = await listVendorServicesUseCase.execute(session.vendorId);

  return (
    <VendorShell
      session={session}
      title="Layanan Vendor"
      description="Tambahkan minimal satu layanan agar checklist verifikasi vendor terpenuhi. Layanan ini juga akan menjadi dasar booking saat vendor sudah approved."
    >
      <ServicesManager initialServices={services} vendorStatus={session.vendorStatus} />
    </VendorShell>
  );
}
