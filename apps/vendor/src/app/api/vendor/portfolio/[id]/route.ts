import { createVendorAssetsUseCases } from "@/core/infrastructure/http/vendor-assets-factory";
import { getVendorActorOrThrow } from "@/core/infrastructure/http/get-vendor-actor";
import { errorResponse, handleApiError, successResponse } from "@/core/infrastructure/http/route-response";
import { portfolioIdParamSchema } from "@/modules/portfolio/schemas/portfolio";

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
