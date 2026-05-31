import { createVendorAssetsUseCases } from "@/core/infrastructure/http/vendor-assets-factory";
import { getVendorActorOrThrow } from "@/core/infrastructure/http/get-vendor-actor";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { serviceIdParamSchema, updateServiceSchema } from "@/modules/services/schemas/service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { vendorId, vendorSession } = await getVendorActorOrThrow();
    const params = await context.params;
    const parsedParams = serviceIdParamSchema.safeParse(params);

    if (!parsedParams.success) {
      return errorResponse(400, "Invalid route params", parsedParams.error.flatten());
    }

    const payload = await parseJsonBody<unknown>(request);
    const parsedBody = updateServiceSchema.safeParse(payload);

    if (!parsedBody.success) {
      return errorResponse(400, "Invalid request body", parsedBody.error.flatten());
    }

    const { updateVendorServiceUseCase } = createVendorAssetsUseCases();
    const data = await updateVendorServiceUseCase.execute(
      vendorId,
      vendorSession.vendorStatus,
      parsedParams.data.id,
      {
        ...parsedBody.data,
        description: parsedBody.data.description?.trim() || parsedBody.data.description,
      }
    );

    return successResponse(data, 200, "Service updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { vendorId, vendorSession } = await getVendorActorOrThrow();
    const params = await context.params;
    const parsedParams = serviceIdParamSchema.safeParse(params);

    if (!parsedParams.success) {
      return errorResponse(400, "Invalid route params", parsedParams.error.flatten());
    }

    const { deleteVendorServiceUseCase } = createVendorAssetsUseCases();
    await deleteVendorServiceUseCase.execute(
      vendorId,
      vendorSession.vendorStatus,
      parsedParams.data.id
    );

    return successResponse({}, 200, "Service deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
