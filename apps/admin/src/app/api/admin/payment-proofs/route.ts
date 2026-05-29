import { getAdminActorOrThrow } from "@/core/infrastructure/http/get-admin-actor";
import { createPaymentMonitoringUseCases } from "@/core/infrastructure/http/payments/payment-monitoring-factory";
import {
  errorResponse,
  handleApiError,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { paymentProofListQuerySchema } from "@/modules/payments/schemas/payment-monitoring";

export async function GET(request: Request) {
  try {
    const { actorId } = await getAdminActorOrThrow();

    const url = new URL(request.url);
    const rawQuery = Object.fromEntries(url.searchParams.entries());
    const parsed = paymentProofListQuerySchema.safeParse(rawQuery);

    if (!parsed.success) {
      return errorResponse(400, "Invalid query params", parsed.error.flatten());
    }

    const { listAdminPaymentProofsUseCase } = createPaymentMonitoringUseCases();
    const data = await listAdminPaymentProofsUseCase.execute(actorId, parsed.data);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
