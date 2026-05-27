import { createAccessControlUseCases } from "@/core/infrastructure/http/access-control-factory";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";

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

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
