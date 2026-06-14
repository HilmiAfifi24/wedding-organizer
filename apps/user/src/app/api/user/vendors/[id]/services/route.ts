import { createPublicVendorUseCases } from "@/core/infrastructure/http/public-vendor-factory";
import {
  errorResponse,
  handleApiError,
  successResponse,
} from "@/core/infrastructure/http/route-response";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { listPublicVendorServicesUseCase } = createPublicVendorUseCases();
    const data = await listPublicVendorServicesUseCase.execute(id);

    if (!data) {
      return errorResponse(404, "Vendor not found");
    }

    return successResponse(data, 200, "Success");
  } catch (error) {
    return handleApiError(error);
  }
}
