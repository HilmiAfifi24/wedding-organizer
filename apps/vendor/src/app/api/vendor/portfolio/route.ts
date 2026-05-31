import { createVendorAssetsUseCases } from "@/core/infrastructure/http/vendor-assets-factory";
import { getVendorActorOrThrow } from "@/core/infrastructure/http/get-vendor-actor";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { createPortfolioSchema } from "@/modules/portfolio/schemas/portfolio";

export async function GET() {
  try {
    const { vendorId } = await getVendorActorOrThrow();
    const { listVendorPortfolioUseCase } = createVendorAssetsUseCases();
    const data = await listVendorPortfolioUseCase.execute(vendorId);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { vendorId, vendorSession } = await getVendorActorOrThrow();
    const payload = await parseJsonBody<unknown>(request);
    const parsed = createPortfolioSchema.safeParse(payload);

    if (!parsed.success) {
      return errorResponse(400, "Invalid request body", parsed.error.flatten());
    }

    const { createVendorPortfolioUseCase } = createVendorAssetsUseCases();
    const data = await createVendorPortfolioUseCase.execute(
      vendorId,
      vendorSession.vendorStatus,
      {
        title: parsed.data.title?.trim() || undefined,
        description: parsed.data.description?.trim() || undefined,
        mediaUrl: parsed.data.mediaUrl,
        mediaType: parsed.data.mediaType,
      }
    );

    return successResponse(data, 201, "Portfolio created successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
