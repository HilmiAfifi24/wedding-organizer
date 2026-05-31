import { getVendorActorOrThrow } from "@/core/infrastructure/http/get-vendor-actor";
import { handleApiError, successResponse } from "@/core/infrastructure/http/route-response";

export async function GET() {
  try {
    const { vendorSession } = await getVendorActorOrThrow();
    return successResponse(vendorSession);
  } catch (error) {
    return handleApiError(error);
  }
}
