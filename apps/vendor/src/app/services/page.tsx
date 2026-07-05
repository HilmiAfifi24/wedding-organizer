import { createVendorAssetsUseCases } from "@/core/infrastructure/http/vendor-assets-factory";
import { prisma } from "@/core/infrastructure/db/prisma";
import { requireVendorRouteAccess } from "@/modules/auth/services/require-vendor-route-access";
import { ServicesManager } from "@/modules/services/components/services-manager";
import { VendorShell } from "@/shared/components/vendor-shell";

export default async function VendorServicesPage() {
  const session = await requireVendorRouteAccess("workspace");
  const { listVendorServicesUseCase } = createVendorAssetsUseCases();
  const [services, adats] = await Promise.all([
    listVendorServicesUseCase.execute(session.vendorId),
    prisma.adat.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <VendorShell
      session={session}
      title="Layanan Vendor"
      description="Tambahkan minimal satu layanan agar checklist verifikasi vendor terpenuhi. Layanan ini juga akan menjadi dasar booking saat vendor sudah approved."
    >
      <ServicesManager
        initialServices={services}
        initialAdats={JSON.parse(JSON.stringify(adats))}
        vendorStatus={session.vendorStatus}
      />
    </VendorShell>
  );
}
