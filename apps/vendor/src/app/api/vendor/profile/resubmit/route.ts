import { createVendorProfileUseCases } from "@/core/infrastructure/http/profile/vendor-profile-factory";
import { getVendorActorOrThrow } from "@/core/infrastructure/http/get-vendor-actor";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { vendorResubmitSchema } from "@/modules/profile/schemas/profile";

export async function PATCH(request: Request) {
  try {
    const { actorId } = await getVendorActorOrThrow();
    const payload = await parseJsonBody<unknown>(request);
    const parsed = vendorResubmitSchema.safeParse(payload);

    if (!parsed.success) {
      return errorResponse(400, "Invalid request body", parsed.error.flatten());
    }

    const { resubmitVendorProfileUseCase } = createVendorProfileUseCases();
    const data = await resubmitVendorProfileUseCase.execute(
      actorId,
      parsed.data.note?.trim() || undefined
    );

    return successResponse(data, 200, "Vendor profile resubmitted");
  } catch (error) {
    return handleApiError(error);
  }
}
