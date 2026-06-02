import { requireVendorRouteAccess } from "@/modules/auth/services/require-vendor-route-access";
import { PaymentProofDetailView } from "@/modules/payments/components/payment-proof-detail-view";
import { VendorShell } from "@/shared/components/vendor-shell";

export default async function VendorPaymentProofDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireVendorRouteAccess("protected");
  const { id } = await params;

  return (
    <VendorShell
      session={session}
      title="Payment Detail"
      description="Tinjau bukti pembayaran, cek detail booking dan customer, lalu ambil keputusan verifikasi dengan aman."
    >
      <PaymentProofDetailView paymentProofId={id} />
    </VendorShell>
  );
}
