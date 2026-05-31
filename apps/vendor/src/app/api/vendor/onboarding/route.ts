import { createVendorAuthUseCases } from "@/core/infrastructure/http/vendor-auth-factory";
import { getVendorActorOrThrow } from "@/core/infrastructure/http/get-vendor-actor";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { onboardingSchema } from "@/modules/auth/schemas/auth";

export async function GET() {
  try {
    const { actorId } = await getVendorActorOrThrow();
    const { getVendorOnboardingUseCase } = createVendorAuthUseCases();
    const data = await getVendorOnboardingUseCase.execute(actorId);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { actorId } = await getVendorActorOrThrow();
    const payload = await parseJsonBody<unknown>(request);
    const parsed = onboardingSchema.safeParse(payload);

    if (!parsed.success) {
      return errorResponse(400, "Invalid request body", parsed.error.flatten());
    }

    const { updateVendorOnboardingUseCase } = createVendorAuthUseCases();
    const data = await updateVendorOnboardingUseCase.execute(actorId, {
      ...parsed.data,
      description: parsed.data.description?.trim() || undefined,
    });

    return successResponse(data, 200, "Vendor onboarding updated");
  } catch (error) {
    return handleApiError(error);
  }
}
