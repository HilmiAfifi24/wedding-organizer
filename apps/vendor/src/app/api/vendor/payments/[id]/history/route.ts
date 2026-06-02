import { createVendorPaymentManagementUseCases } from "@/core/infrastructure/http/payments/vendor-payment-management-factory";
import { getVendorActorOrThrow } from "@/core/infrastructure/http/get-vendor-actor";
import { errorResponse, handleApiError, successResponse } from "@/core/infrastructure/http/route-response";
import { paymentProofIdParamSchema } from "@/modules/payments/schemas/payment-management";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { vendorId, vendorSession } = await getVendorActorOrThrow();
    const params = await context.params;
    const parsedParams = paymentProofIdParamSchema.safeParse(params);

    if (!parsedParams.success) {
      return errorResponse(400, "Invalid payment proof id", parsedParams.error.flatten());
    }

    const { getVendorPaymentProofHistoryUseCase } = createVendorPaymentManagementUseCases();
    const data = await getVendorPaymentProofHistoryUseCase.execute({
      vendorId,
      vendorStatus: vendorSession.vendorStatus,
      paymentProofId: parsedParams.data.id,
    });

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
