import { createVendorAssetsUseCases } from "@/core/infrastructure/http/vendor-assets-factory";
import { requireVendorRouteAccess } from "@/modules/auth/services/require-vendor-route-access";
import { PortfolioManager } from "@/modules/portfolio/components/portfolio-manager";
import { VendorShell } from "@/shared/components/vendor-shell";

export default async function VendorPortfolioPage() {
  const session = await requireVendorRouteAccess("workspace");
  const { listVendorPortfolioUseCase } = createVendorAssetsUseCases();
  const portfolio = await listVendorPortfolioUseCase.execute(session.vendorId);

  return (
    <VendorShell
      session={session}
      title="Portfolio Vendor"
      description="Tambahkan minimal satu portfolio untuk menunjukkan kualitas vendor dan memenuhi checklist approval admin."
    >
      <PortfolioManager initialPortfolio={portfolio} vendorStatus={session.vendorStatus} />
    </VendorShell>
  );
}
