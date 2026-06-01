import { createVendorProfileUseCases } from "@/core/infrastructure/http/profile/vendor-profile-factory";
import { getVendorActorOrThrow } from "@/core/infrastructure/http/get-vendor-actor";
import { errorResponse, handleApiError, successResponse } from "@/core/infrastructure/http/route-response";
import { createUploadImageSchema } from "@/modules/profile/schemas/profile";

const getMaxFileSizeBytes = () => {
  const parsed = Number(process.env.VENDOR_PROFILE_IMAGE_MAX_SIZE_BYTES ?? 2 * 1024 * 1024);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 2 * 1024 * 1024;
};

export async function POST(request: Request) {
  try {
    const { actorId } = await getVendorActorOrThrow();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return errorResponse(400, "Invalid file payload");
    }

    const uploadSchema = createUploadImageSchema(getMaxFileSizeBytes());
    const parsed = uploadSchema.safeParse({ file });

    if (!parsed.success) {
      return errorResponse(400, "Invalid image file", parsed.error.flatten());
    }

    const { updateVendorLogoUseCase } = createVendorProfileUseCases();
    const data = await updateVendorLogoUseCase.execute(actorId, parsed.data.file);

    return successResponse(data, 200, "Logo updated");
  } catch (error) {
    return handleApiError(error);
  }
}
