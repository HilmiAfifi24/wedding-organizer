import { createVendorAssetsUseCases } from "@/core/infrastructure/http/vendor-assets-factory";
import { getVendorActorOrThrow } from "@/core/infrastructure/http/get-vendor-actor";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { createServiceSchema } from "@/modules/services/schemas/service";

export async function GET() {
  try {
    const { vendorId } = await getVendorActorOrThrow();
    const { listVendorServicesUseCase } = createVendorAssetsUseCases();
    const data = await listVendorServicesUseCase.execute(vendorId);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { vendorId, vendorSession } = await getVendorActorOrThrow();
    const payload = await parseJsonBody<unknown>(request);
    const parsed = createServiceSchema.safeParse(payload);

    if (!parsed.success) {
      return errorResponse(400, "Invalid request body", parsed.error.flatten());
    }

    const { createVendorServiceUseCase } = createVendorAssetsUseCases();
    const data = await createVendorServiceUseCase.execute(
      vendorId,
      vendorSession.vendorStatus,
      {
        name: parsed.data.name,
        description: parsed.data.description?.trim() || undefined,
        price: parsed.data.price,
        isActive: parsed.data.isActive,
      }
    );

    return successResponse(data, 201, "Service created successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
