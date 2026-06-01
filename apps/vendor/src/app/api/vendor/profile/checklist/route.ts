import { createVendorProfileUseCases } from "@/core/infrastructure/http/profile/vendor-profile-factory";
import { getVendorActorOrThrow } from "@/core/infrastructure/http/get-vendor-actor";
import { handleApiError, successResponse } from "@/core/infrastructure/http/route-response";

export async function GET() {
  try {
    const { vendorId } = await getVendorActorOrThrow();
    const { getVendorChecklistUseCase } = createVendorProfileUseCases();
    const data = await getVendorChecklistUseCase.execute(vendorId);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
