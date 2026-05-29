import { getAdminActorOrThrow } from "@/core/infrastructure/http/get-admin-actor";
import { createPaymentMonitoringUseCases } from "@/core/infrastructure/http/payments/payment-monitoring-factory";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import {
  paymentOverrideBodySchema,
  paymentProofIdParamSchema,
} from "@/modules/payments/schemas/payment-monitoring";

export async function PATCH(
  request: Request,
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

    const body = await parseJsonBody<unknown>(request);
    const parsedBody = paymentOverrideBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return errorResponse(400, "Invalid request body", parsedBody.error.flatten());
    }

    const { forceVerifyPaymentProofUseCase } = createPaymentMonitoringUseCases();
    const data = await forceVerifyPaymentProofUseCase.execute(
      actorId,
      parsedParams.data.id,
      parsedBody.data.reason
    );

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
