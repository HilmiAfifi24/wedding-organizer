import { createVendorPaymentManagementUseCases } from "@/core/infrastructure/http/payments/vendor-payment-management-factory";
import { getVendorActorOrThrow } from "@/core/infrastructure/http/get-vendor-actor";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import {
  paymentProofIdParamSchema,
  rejectPaymentProofBodySchema,
} from "@/modules/payments/schemas/payment-management";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { actorId, vendorId, vendorSession } = await getVendorActorOrThrow();
    const params = await context.params;
    const parsedParams = paymentProofIdParamSchema.safeParse(params);

    if (!parsedParams.success) {
      return errorResponse(400, "Invalid payment proof id", parsedParams.error.flatten());
    }

    const rawBody = await parseJsonBody<unknown>(request);
    const parsedBody = rejectPaymentProofBodySchema.safeParse(rawBody);

    if (!parsedBody.success) {
      return errorResponse(400, "Invalid request body", parsedBody.error.flatten());
    }

    const { rejectVendorPaymentProofUseCase } = createVendorPaymentManagementUseCases();
    const data = await rejectVendorPaymentProofUseCase.execute(
      {
        actorId,
        vendorId,
        vendorStatus: vendorSession.vendorStatus,
        paymentProofId: parsedParams.data.id,
      },
      parsedBody.data
    );

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
