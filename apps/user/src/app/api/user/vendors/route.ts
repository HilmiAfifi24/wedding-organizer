import { createPublicVendorUseCases } from "@/core/infrastructure/http/public-vendor-factory";
import {
  errorResponse,
  handleApiError,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { vendorDiscoveryQuerySchema } from "@/modules/vendors/schemas/vendor-discovery";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const rawQuery = Object.fromEntries(url.searchParams.entries());
    const parsed = vendorDiscoveryQuerySchema.safeParse(rawQuery);

    if (!parsed.success) {
      return errorResponse(400, "Invalid query parameters", parsed.error.flatten());
    }

    const { listPublicVendorsUseCase } = createPublicVendorUseCases();
    const data = await listPublicVendorsUseCase.execute(parsed.data);

    return successResponse(data, 200, "Success");
  } catch (error) {
    return handleApiError(error);
  }
}
