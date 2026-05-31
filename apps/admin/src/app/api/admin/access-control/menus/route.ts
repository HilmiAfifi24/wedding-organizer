import { createAccessControlUseCases } from "@/core/infrastructure/http/access-control-factory";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { revalidateAdminNavigationCache } from "@/modules/access-control/services/navigation-cache";
import { createAccessMenuSchema } from "@/modules/access-control/validators/access-control";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accessProfileId = searchParams.get("accessProfileId") ?? undefined;

    const { listAccessMenusUseCase } = createAccessControlUseCases();
    const data = await listAccessMenusUseCase.execute(accessProfileId);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody<unknown>(request);
    const parsed = createAccessMenuSchema.safeParse(payload);
    if (!parsed.success) {
      return errorResponse(400, "Invalid payload", parsed.error.flatten());
    }

    const { createAccessMenuUseCase } = createAccessControlUseCases();
    const created = await createAccessMenuUseCase.execute(parsed.data);
    revalidateAdminNavigationCache();

    return successResponse(created, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
