import { requireVendorRouteAccess } from "@/modules/auth/services/require-vendor-route-access";
import { VendorModulePlaceholder } from "@/shared/components/vendor-module-placeholder";
import { VendorShell } from "@/shared/components/vendor-shell";

export default async function VendorPortfolioPage() {
  const session = await requireVendorRouteAccess("protected");

  return (
    <VendorShell
      session={session}
      title="Portfolio Vendor"
      description="Portfolio membantu admin memverifikasi kualitas vendor dan nantinya menjadi materi showcase di marketplace user."
    >
      <VendorModulePlaceholder
        title="Portfolio Workspace Sudah Diamankan"
        description="Vendor approved sudah bisa diarahkan ke halaman portfolio ini. Tahap selanjutnya tinggal menambahkan CRUD portfolio dan upload media."
      />
    </VendorShell>
  );
}
