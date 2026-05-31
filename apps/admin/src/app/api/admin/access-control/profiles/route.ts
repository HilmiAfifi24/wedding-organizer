import { createAccessControlUseCases } from "@/core/infrastructure/http/access-control-factory";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { revalidateAdminNavigationCache } from "@/modules/access-control/services/navigation-cache";
import { createAccessProfileSchema } from "@/modules/access-control/validators/access-control";

export async function GET() {
  try {
    const { listAccessProfilesUseCase } = createAccessControlUseCases();
    const data = await listAccessProfilesUseCase.execute();

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody<unknown>(request);
    const parsed = createAccessProfileSchema.safeParse(payload);
    if (!parsed.success) {
      return errorResponse(400, "Invalid payload", parsed.error.flatten());
    }

    const { createAccessProfileUseCase } = createAccessControlUseCases();
    const created = await createAccessProfileUseCase.execute(parsed.data);
    revalidateAdminNavigationCache();

    return successResponse(created, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
