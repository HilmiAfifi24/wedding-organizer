import { createPublicVendorUseCases } from "@/core/infrastructure/http/public-vendor-factory";
import { getCurrentUserSession } from "@/modules/auth/services/current-user-session";
import { VendorsEmptyState } from "@/modules/vendors/components/vendors-empty-state";
import { VendorsFilterBar } from "@/modules/vendors/components/vendors-filter-bar";
import { VendorsGrid } from "@/modules/vendors/components/vendors-grid";
import { VendorsPagination } from "@/modules/vendors/components/vendors-pagination";
import { vendorDiscoveryQuerySchema } from "@/modules/vendors/schemas/vendor-discovery";
import { PublicSiteShell } from "@/shared/components/public-site-shell";

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [session, rawSearchParams] = await Promise.all([
    getCurrentUserSession(),
    searchParams,
  ]);
  const normalized = Object.fromEntries(
    Object.entries(rawSearchParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  );
  const query = vendorDiscoveryQuerySchema.parse(normalized);
  const { listPublicVendorsUseCase } = createPublicVendorUseCases();
  const result = await listPublicVendorsUseCase.execute(query);

  return (
    <PublicSiteShell session={session}>
      <section className="space-y-5">
        <div className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-rose-500">
            Public Marketplace
          </p>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Temukan vendor approved yang siap membantu hari pernikahan Anda.
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-slate-600">
                Hanya vendor dengan status approved yang akan tampil di sini, lengkap dengan rating, harga awal, dan ringkasan layanan publiknya.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-950 px-5 py-4 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Approved Vendors</p>
              <p className="mt-2 text-3xl font-semibold">{result.totalItems}</p>
            </div>
          </div>
        </div>

        <VendorsFilterBar
          categories={result.filters.categories}
          cities={result.filters.cities}
          adats={result.filters.adats}
          query={query}
        />

        {result.items.length ? <VendorsGrid items={result.items} /> : <VendorsEmptyState />}

        <VendorsPagination page={result.page} totalPages={result.totalPages} query={query} />
      </section>
    </PublicSiteShell>
  );
}
