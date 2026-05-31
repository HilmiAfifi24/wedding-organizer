import { createAccessControlUseCases } from "@/core/infrastructure/http/access-control-factory";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { revalidateAdminNavigationCache } from "@/modules/access-control/services/navigation-cache";
import { setAccessPermissionsPayloadSchema } from "@/modules/access-control/validators/access-control";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { getAccessProfilePermissionsUseCase } = createAccessControlUseCases();

    const data = await getAccessProfilePermissionsUseCase.execute(id);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = await parseJsonBody<unknown>(request);
    const parsed = setAccessPermissionsPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      return errorResponse(400, "Invalid permissions payload", parsed.error.flatten());
    }

    const permissions = Array.isArray(parsed.data)
      ? parsed.data
      : parsed.data.permissions;

    const { setAccessProfilePermissionsUseCase } = createAccessControlUseCases();
    const data = await setAccessProfilePermissionsUseCase.execute(id, permissions);
    revalidateAdminNavigationCache();

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
