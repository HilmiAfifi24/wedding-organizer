import { createVendorAssetsUseCases } from "@/core/infrastructure/http/vendor-assets-factory";
import { getVendorActorOrThrow } from "@/core/infrastructure/http/get-vendor-actor";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { portfolioIdParamSchema, updatePortfolioSchema } from "@/modules/portfolio/schemas/portfolio";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { vendorId, vendorSession } = await getVendorActorOrThrow();
    const params = await context.params;
    const parsedParams = portfolioIdParamSchema.safeParse(params);

    if (!parsedParams.success) {
      return errorResponse(400, "Invalid route params", parsedParams.error.flatten());
    }

    const { deleteVendorPortfolioUseCase } = createVendorAssetsUseCases();
    await deleteVendorPortfolioUseCase.execute(
      vendorId,
      vendorSession.vendorStatus,
      parsedParams.data.id
    );

    return successResponse({}, 200, "Portfolio deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { vendorId, vendorSession } = await getVendorActorOrThrow();
    const params = await context.params;
    const parsedParams = portfolioIdParamSchema.safeParse(params);

    if (!parsedParams.success) {
      return errorResponse(400, "Invalid route params", parsedParams.error.flatten());
    }

    const payload = await parseJsonBody<unknown>(request);
    const parsedBody = updatePortfolioSchema.safeParse(payload);

    if (!parsedBody.success) {
      return errorResponse(400, "Invalid request body", parsedBody.error.flatten());
    }

    const { updateVendorPortfolioUseCase } = createVendorAssetsUseCases();
    const data = await updateVendorPortfolioUseCase.execute(
      vendorId,
      vendorSession.vendorStatus,
      parsedParams.data.id,
      {
        ...parsedBody.data,
        title: parsedBody.data.title?.trim() || undefined,
        description: parsedBody.data.description?.trim() || undefined,
        mediaUrl: parsedBody.data.mediaUrl?.trim(),
      }
    );

    return successResponse(data, 200, "Portfolio updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
