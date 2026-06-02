import { createVendorPaymentManagementUseCases } from "@/core/infrastructure/http/payments/vendor-payment-management-factory";
import { getVendorActorOrThrow } from "@/core/infrastructure/http/get-vendor-actor";
import { errorResponse, handleApiError, successResponse } from "@/core/infrastructure/http/route-response";
import { vendorPaymentListQuerySchema } from "@/modules/payments/schemas/payment-management";

export async function GET(request: Request) {
  try {
    const { vendorId, vendorSession } = await getVendorActorOrThrow();

    const url = new URL(request.url);
    const rawQuery = Object.fromEntries(url.searchParams.entries());
    const parsed = vendorPaymentListQuerySchema.safeParse(rawQuery);

    if (!parsed.success) {
      return errorResponse(400, "Invalid query params", parsed.error.flatten());
    }

    const { listVendorPaymentProofsUseCase } = createVendorPaymentManagementUseCases();
    const data = await listVendorPaymentProofsUseCase.execute(
      { vendorId, vendorStatus: vendorSession.vendorStatus },
      parsed.data
    );

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
