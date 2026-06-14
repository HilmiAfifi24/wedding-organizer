import { notFound, redirect } from "next/navigation";

import { createUserPaymentUseCases } from "@/core/infrastructure/http/user-payment-factory";
import { requireUserRouteAccess } from "@/modules/auth/services/require-user-route-access";
import { PaymentProofUploadForm } from "@/modules/payments/components/payment-proof-upload-form";
import { paymentUploadPageQuerySchema } from "@/modules/payments/schemas/payment-upload";
import { UserShell } from "@/shared/components/user-shell";

export default async function BookingPaymentUploadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireUserRouteAccess("protected");
  const { id } = await params;
  const rawSearchParams = await searchParams;
  const parsed = paymentUploadPageQuerySchema.safeParse({
    termId: typeof rawSearchParams.termId === "string" ? rawSearchParams.termId : undefined,
  });

  if (!parsed.success) {
    redirect(`/bookings/${id}/payments`);
  }

  const { getUserPaymentTermUseCase } = createUserPaymentUseCases();
  const context = await getUserPaymentTermUseCase.execute(parsed.data.termId, session).catch(() => null);

  if (!context || context.bookingId !== id) {
    notFound();
  }

  return (
    <UserShell
      session={session}
      title="Upload Bukti Pembayaran"
      description="Unggah file bukti pembayaran untuk termin yang dipilih dan tunggu verifikasi vendor."
    >
      <PaymentProofUploadForm context={context} />
    </UserShell>
  );
}
