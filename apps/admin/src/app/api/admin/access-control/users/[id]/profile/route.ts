import { createAccessControlUseCases } from "@/core/infrastructure/http/access-control-factory";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { revalidateAdminNavigationCache } from "@/modules/access-control/services/navigation-cache";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type AssignAccessProfilePayload = {
  accessProfileId?: string | null;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = await parseJsonBody<AssignAccessProfilePayload>(request);

    if (payload.accessProfileId !== null && typeof payload.accessProfileId !== "string") {
      return errorResponse(400, "accessProfileId must be string or null");
    }

    const { assignUserAccessProfileUseCase } = createAccessControlUseCases();
    const data = await assignUserAccessProfileUseCase.execute(id, payload.accessProfileId ?? null);
    revalidateAdminNavigationCache();

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
