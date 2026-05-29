import { getAdminActorOrThrow } from "@/core/infrastructure/http/get-admin-actor";
import { createPaymentMonitoringUseCases } from "@/core/infrastructure/http/payments/payment-monitoring-factory";
import { errorResponse, handleApiError, successResponse } from "@/core/infrastructure/http/route-response";
import { paymentProofIdParamSchema } from "@/modules/payments/schemas/payment-monitoring";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { actorId } = await getAdminActorOrThrow();
    const params = await context.params;
    const parsedParams = paymentProofIdParamSchema.safeParse(params);

    if (!parsedParams.success) {
      return errorResponse(400, "Invalid route params", parsedParams.error.flatten());
    }

    const { getAdminPaymentProofHistoryUseCase } = createPaymentMonitoringUseCases();
    const data = await getAdminPaymentProofHistoryUseCase.execute(actorId, parsedParams.data.id);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
