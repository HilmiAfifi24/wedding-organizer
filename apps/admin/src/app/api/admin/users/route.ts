import { createUserManagementUseCases } from "@/core/infrastructure/http/users/user-management-factory";
import { getAdminActorOrThrow } from "@/core/infrastructure/http/get-admin-actor";
import { errorResponse, handleApiError, successResponse } from "@/core/infrastructure/http/route-response";
import { userListQuerySchema } from "@/modules/users/schemas/user-management";

export async function GET(request: Request) {
  try {
    const { actorId } = await getAdminActorOrThrow();

    const url = new URL(request.url);
    const rawQuery = Object.fromEntries(url.searchParams.entries());
    const parsed = userListQuerySchema.safeParse(rawQuery);

    if (!parsed.success) {
      return errorResponse(400, "Invalid query params", parsed.error.flatten());
    }

    const { listAdminUsersUseCase } = createUserManagementUseCases();
    const data = await listAdminUsersUseCase.execute(actorId, parsed.data);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
