import { createAdatManagementUseCases } from "@/core/infrastructure/http/adats/adat-management-factory";
import { getAdminActorOrThrow } from "@/core/infrastructure/http/get-admin-actor";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import {
  adatIdParamSchema,
  updateAdatBodySchema,
} from "@/modules/adats/schemas/adat-management";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { actorId } = await getAdminActorOrThrow();
    const params = await context.params;
    const parsedParams = adatIdParamSchema.safeParse(params);

    if (!parsedParams.success) {
      return errorResponse(400, "Invalid route params", parsedParams.error.flatten());
    }

    const payload = await parseJsonBody<unknown>(request);
    const parsedBody = updateAdatBodySchema.safeParse(payload);

    if (!parsedBody.success) {
      return errorResponse(400, "Invalid request body", parsedBody.error.flatten());
    }

    const { updateAdminAdatUseCase } = createAdatManagementUseCases();
    const data = await updateAdminAdatUseCase.execute(
      actorId,
      parsedParams.data.id,
      parsedBody.data
    );

    return successResponse(data, 200, "Adat updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { actorId } = await getAdminActorOrThrow();
    const params = await context.params;
    const parsedParams = adatIdParamSchema.safeParse(params);

    if (!parsedParams.success) {
      return errorResponse(400, "Invalid route params", parsedParams.error.flatten());
    }

    const { deleteAdminAdatUseCase } = createAdatManagementUseCases();
    const data = await deleteAdminAdatUseCase.execute(actorId, parsedParams.data.id);

    return successResponse(data, 200, "Adat deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
