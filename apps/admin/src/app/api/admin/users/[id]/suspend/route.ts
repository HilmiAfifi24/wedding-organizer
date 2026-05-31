import { createUserManagementUseCases } from "@/core/infrastructure/http/users/user-management-factory";
import { getAdminActorOrThrow } from "@/core/infrastructure/http/get-admin-actor";
import { errorResponse, handleApiError, successResponse } from "@/core/infrastructure/http/route-response";
import { revalidateAdminSessionCache } from "@/modules/auth/services/admin-session-cache";
import { suspendUserBodySchema, userIdParamSchema } from "@/modules/users/schemas/user-management";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const parseOptionalJsonBody = async (request: Request): Promise<unknown> => {
  const raw = await request.text();
  if (!raw.trim()) {
    return {};
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new Error("Invalid JSON body");
  }
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { actorId } = await getAdminActorOrThrow();

    const params = await context.params;
    const parsedParams = userIdParamSchema.safeParse(params);
    if (!parsedParams.success) {
      return errorResponse(400, "Invalid route params", parsedParams.error.flatten());
    }

    const body = await parseOptionalJsonBody(request);
    const parsedBody = suspendUserBodySchema.safeParse(body);
    if (!parsedBody.success) {
      return errorResponse(400, "Invalid request body", parsedBody.error.flatten());
    }

    const { suspendAdminUserUseCase } = createUserManagementUseCases();
    const data = await suspendAdminUserUseCase.execute(actorId, parsedParams.data.id);
    revalidateAdminSessionCache();

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
