import { notFound } from "next/navigation";

import { createUserPaymentUseCases } from "@/core/infrastructure/http/user-payment-factory";
import { requireUserRouteAccess } from "@/modules/auth/services/require-user-route-access";
import { PaymentProofDetailView } from "@/modules/payments/components/payment-proof-detail-view";
import { UserShell } from "@/shared/components/user-shell";

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUserRouteAccess("protected");
  const { id } = await params;
  const { getUserPaymentProofDetailUseCase } = createUserPaymentUseCases();
  const payment = await getUserPaymentProofDetailUseCase.execute(id, session).catch(() => null);

  if (!payment) {
    notFound();
  }

  return (
    <UserShell
      session={session}
      title="Detail Payment Proof"
      description="Tinjau file bukti pembayaran, status verifikasi, dan histori perubahan proof Anda."
    >
      <PaymentProofDetailView payment={payment} />
    </UserShell>
  );
}
