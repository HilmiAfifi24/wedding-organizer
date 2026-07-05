import { PaymentProofStatus } from "@wo/shared-types";

import { createUserPaymentUseCases } from "@/core/infrastructure/http/user-payment-factory";
import { requireUserRouteAccess } from "@/modules/auth/services/require-user-route-access";
import { PaymentsList } from "@/modules/payments/components/payments-list";
import { paymentQuerySchema } from "@/modules/payments/schemas/payment-upload";
import { UserShell } from "@/shared/components/user-shell";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireUserRouteAccess("protected");
  const rawSearchParams = await searchParams;
  const parsed = paymentQuerySchema.safeParse({
    status: typeof rawSearchParams.status === "string" ? rawSearchParams.status : undefined,
    dateFrom: typeof rawSearchParams.dateFrom === "string" ? rawSearchParams.dateFrom : undefined,
    dateTo: typeof rawSearchParams.dateTo === "string" ? rawSearchParams.dateTo : undefined,
    page: typeof rawSearchParams.page === "string" ? rawSearchParams.page : undefined,
    limit: typeof rawSearchParams.limit === "string" ? rawSearchParams.limit : undefined,
  });

  const query = parsed.success
    ? parsed.data
    : {
        page: 1,
        limit: 10,
      };
  const { listUserPaymentsUseCase } = createUserPaymentUseCases();
  const payments = await listUserPaymentsUseCase.execute(query, session);

  return (
    <UserShell
      session={session}
      title="Pembayaran"
      description="Kelola payment proof dan status verifikasi pembayaran untuk setiap booking."
    >
      <section className="space-y-5">
        <form className="grid gap-3 rounded-[28px] border border-white/10 bg-card p-5 shadow-2xl md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Status</label>
            <select
              name="status"
              defaultValue={typeof rawSearchParams.status === "string" ? rawSearchParams.status : ""}
              className="h-11 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none"
            >
              <option value="" className="bg-slate-950">Semua status</option>
              <option value={PaymentProofStatus.PENDING} className="bg-slate-950">Pending</option>
              <option value={PaymentProofStatus.VERIFIED} className="bg-slate-950">Verified</option>
              <option value={PaymentProofStatus.REJECTED} className="bg-slate-950">Rejected</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Dari tanggal</label>
            <input
              type="date"
              name="dateFrom"
              defaultValue={typeof rawSearchParams.dateFrom === "string" ? rawSearchParams.dateFrom : ""}
              className="h-11 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Sampai tanggal</label>
            <input
              type="date"
              name="dateTo"
              defaultValue={typeof rawSearchParams.dateTo === "string" ? rawSearchParams.dateTo : ""}
              className="h-11 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="h-11 w-full rounded-2xl bg-rose-600 text-sm font-medium text-white transition hover:bg-rose-700"
            >
              Terapkan filter
            </button>
          </div>
        </form>

        <PaymentsList items={payments.items} />
      </section>
    </UserShell>
  );
}
