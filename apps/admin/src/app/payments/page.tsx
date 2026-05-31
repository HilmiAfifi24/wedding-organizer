import { createPaymentMonitoringUseCases } from "@/core/infrastructure/http/payments/payment-monitoring-factory";
import { getEffectiveNavigationForUser } from "@/modules/access-control/services/get-effective-navigation";
import { requireAdminSession } from "@/modules/auth/services/require-admin-session";
import { PaymentsManagementDashboard } from "@/modules/payments/components/payments-management-dashboard";
import type { PaymentMonitoringInitialState } from "@/modules/payments/hooks/use-payment-monitoring";
import { paymentProofListQuerySchema } from "@/modules/payments/schemas/payment-monitoring";
import { AdminLayout } from "@/shared/components/admin-layout";

export default async function PaymentsPage() {
  const session = await requireAdminSession();
  const parsedQuery = paymentProofListQuerySchema.parse({});
  const { listAdminPaymentProofsUseCase } = createPaymentMonitoringUseCases();
  const [navigation, initialList] = await Promise.all([
    getEffectiveNavigationForUser(session.user.id),
    listAdminPaymentProofsUseCase.execute(session.user.id, parsedQuery),
  ]);
  const initialState: PaymentMonitoringInitialState = {
    list: initialList,
    queryState: {
      page: parsedQuery.page,
      pageSize: parsedQuery.pageSize,
      filters: {
        search: parsedQuery.search,
        paymentProofStatus: parsedQuery.paymentProofStatus ?? "ALL",
        bookingStatus: parsedQuery.bookingStatus ?? "ALL",
        vendor: parsedQuery.vendor,
        sortBy: parsedQuery.sortBy,
        sortDirection: parsedQuery.sortDirection,
      },
    },
  };

  return (
    <AdminLayout user={session.user} navigation={navigation}>
      <PaymentsManagementDashboard initialState={initialState} />
    </AdminLayout>
  );
}
