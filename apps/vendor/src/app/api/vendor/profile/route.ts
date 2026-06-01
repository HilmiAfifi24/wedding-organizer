import { createVendorProfileUseCases } from "@/core/infrastructure/http/profile/vendor-profile-factory";
import { getVendorActorOrThrow } from "@/core/infrastructure/http/get-vendor-actor";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { vendorProfileUpdateSchema } from "@/modules/profile/schemas/profile";

export async function GET() {
  try {
    const { actorId } = await getVendorActorOrThrow();
    const { getVendorProfileUseCase } = createVendorProfileUseCases();
    const data = await getVendorProfileUseCase.execute(actorId);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { actorId } = await getVendorActorOrThrow();
    const payload = await parseJsonBody<unknown>(request);
    const parsed = vendorProfileUpdateSchema.safeParse(payload);

    if (!parsed.success) {
      return errorResponse(400, "Invalid request body", parsed.error.flatten());
    }

    const { updateVendorProfileUseCase } = createVendorProfileUseCases();
    const data = await updateVendorProfileUseCase.execute(actorId, {
      businessName: parsed.data.businessName,
      description: parsed.data.description?.trim() || undefined,
      categoryId: parsed.data.categoryId,
      businessType: parsed.data.businessType?.trim() || undefined,
      establishedYear: parsed.data.establishedYear,
      phoneNumber: parsed.data.phoneNumber,
      whatsappNumber: parsed.data.whatsappNumber?.trim() || undefined,
      website: parsed.data.website,
      businessAddress: parsed.data.businessAddress,
      city: parsed.data.city,
      province: parsed.data.province,
      postalCode: parsed.data.postalCode?.trim() || undefined,
      instagramUrl: parsed.data.instagramUrl,
      tiktokUrl: parsed.data.tiktokUrl,
      facebookUrl: parsed.data.facebookUrl,
      youtubeUrl: parsed.data.youtubeUrl,
    });

    return successResponse(data, 200, "Vendor profile updated");
  } catch (error) {
    return handleApiError(error);
  }
}
