import { notFound } from "next/navigation";

import { createPublicVendorUseCases } from "@/core/infrastructure/http/public-vendor-factory";
import { getCurrentUserSession } from "@/modules/auth/services/current-user-session";
import { VendorBookingCta } from "@/modules/vendors/components/vendor-booking-cta";
import { VendorDetailOverview } from "@/modules/vendors/components/vendor-detail-overview";
import { VendorPortfolioSection } from "@/modules/vendors/components/vendor-portfolio-section";
import { VendorReviewsSection } from "@/modules/vendors/components/vendor-reviews-section";
import { VendorServicesSection } from "@/modules/vendors/components/vendor-services-section";
import { PublicSiteShell } from "@/shared/components/public-site-shell";

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, useCases] = await Promise.all([
    getCurrentUserSession(),
    Promise.resolve(createPublicVendorUseCases()),
  ]);

  const [vendor, services, portfolio, reviews] = await Promise.all([
    useCases.getPublicVendorDetailUseCase.execute(id),
    useCases.listPublicVendorServicesUseCase.execute(id),
    useCases.listPublicVendorPortfolioUseCase.execute(id),
    useCases.listPublicVendorReviewsUseCase.execute(id),
  ]);

  if (!vendor || !services || !portfolio || !reviews) {
    notFound();
  }

  return (
    <PublicSiteShell session={session}>
      <section className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-rose-500">
              Approved Vendor Detail
            </p>
            <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white">
              {vendor.businessName}
            </h2>
          </div>
          <VendorBookingCta vendorId={vendor.id} session={session} />
        </div>

        <VendorDetailOverview vendor={vendor} />
        <VendorServicesSection vendorId={vendor.id} services={services} session={session} />
        <VendorPortfolioSection portfolio={portfolio} />
        <VendorReviewsSection
          reviews={reviews}
          averageRating={vendor.averageRating}
          totalReviews={vendor.totalReviews}
        />
      </section>
    </PublicSiteShell>
  );
}
