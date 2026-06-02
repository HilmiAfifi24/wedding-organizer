import { requireVendorRouteAccess } from "@/modules/auth/services/require-vendor-route-access";
import { PaymentsManagementDashboard } from "@/modules/payments/components/payments-management-dashboard";
import { VendorShell } from "@/shared/components/vendor-shell";

export default async function VendorPaymentsPage() {
  const session = await requireVendorRouteAccess("protected");

  return (
    <VendorShell
      session={session}
      title="Vendor Payments"
      description="Monitor payment proof dari booking Anda, verifikasi pembayaran offline, dan pastikan setiap perubahan status terekam rapi."
    >
      <PaymentsManagementDashboard />
    </VendorShell>
  );
}
