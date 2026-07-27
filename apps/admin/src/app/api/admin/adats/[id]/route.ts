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
  console.log("PATCH /api/admin/adats/[id] route handler called");
  try {
    const { actorId } = await getAdminActorOrThrow();
    console.log("Actor ID retrieved:", actorId);
    const params = await context.params;
    const parsedParams = adatIdParamSchema.safeParse(params);

    if (!parsedParams.success) {
      console.log("Adat route param validation failed:", parsedParams.error.flatten());
      return errorResponse(400, "Invalid route params", parsedParams.error.flatten());
    }
    console.log("Route parameters parsed successfully:", parsedParams.data);

    const payload = await parseJsonBody<unknown>(request);
    const parsedBody = updateAdatBodySchema.safeParse(payload);

    if (!parsedBody.success) {
      console.log("Adat request body validation failed:", parsedBody.error.flatten());
      return errorResponse(400, "Invalid request body", parsedBody.error.flatten());
    }
    console.log("Request body parsed successfully:", parsedBody.data);

    const { updateAdminAdatUseCase } = createAdatManagementUseCases();
    console.log("Executing updateAdminAdatUseCase...");
    const data = await updateAdminAdatUseCase.execute(
      actorId,
      parsedParams.data.id,
      parsedBody.data
    );
    console.log("Update database query successful. Result:", data);

    return successResponse(data, 200, "Adat updated successfully");
  } catch (error) {
    console.error("PATCH Adat error caught in route handler:", error);
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
