import { createUserManagementUseCases } from "@/core/infrastructure/http/users/user-management-factory";
import { getAdminActorOrThrow } from "@/core/infrastructure/http/get-admin-actor";
import { errorResponse, handleApiError, successResponse } from "@/core/infrastructure/http/route-response";
import { userDetailQuerySchema, userIdParamSchema } from "@/modules/users/schemas/user-management";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { actorId } = await getAdminActorOrThrow();

    const params = await context.params;
    const parsedParams = userIdParamSchema.safeParse(params);
    if (!parsedParams.success) {
      return errorResponse(400, "Invalid route params", parsedParams.error.flatten());
    }

    const url = new URL(request.url);
    const rawQuery = Object.fromEntries(url.searchParams.entries());
    const parsedQuery = userDetailQuerySchema.safeParse(rawQuery);
    if (!parsedQuery.success) {
      return errorResponse(400, "Invalid query params", parsedQuery.error.flatten());
    }

    const { getAdminUserDetailUseCase } = createUserManagementUseCases();
    const data = await getAdminUserDetailUseCase.execute(actorId, parsedParams.data.id, parsedQuery.data);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { actorId } = await getAdminActorOrThrow();

    const params = await context.params;
    const parsedParams = userIdParamSchema.safeParse(params);
    if (!parsedParams.success) {
      return errorResponse(400, "Invalid route params", parsedParams.error.flatten());
    }

    const { softDeleteAdminUserUseCase } = createUserManagementUseCases();
    const data = await softDeleteAdminUserUseCase.execute(actorId, parsedParams.data.id);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
