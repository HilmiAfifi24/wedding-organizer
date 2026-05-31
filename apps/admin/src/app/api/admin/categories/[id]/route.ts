import { createCategoryManagementUseCases } from "@/core/infrastructure/http/categories/category-management-factory";
import { getAdminActorOrThrow } from "@/core/infrastructure/http/get-admin-actor";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import {
  categoryIdParamSchema,
  updateCategoryBodySchema,
} from "@/modules/categories/schemas/category-management";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { actorId } = await getAdminActorOrThrow();
    const params = await context.params;
    const parsedParams = categoryIdParamSchema.safeParse(params);

    if (!parsedParams.success) {
      return errorResponse(400, "Invalid route params", parsedParams.error.flatten());
    }

    const payload = await parseJsonBody<unknown>(request);
    const parsedBody = updateCategoryBodySchema.safeParse(payload);

    if (!parsedBody.success) {
      return errorResponse(400, "Invalid request body", parsedBody.error.flatten());
    }

    const { updateAdminCategoryUseCase } = createCategoryManagementUseCases();
    const data = await updateAdminCategoryUseCase.execute(
      actorId,
      parsedParams.data.id,
      parsedBody.data
    );

    return successResponse(data, 200, "Category updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { actorId } = await getAdminActorOrThrow();
    const params = await context.params;
    const parsedParams = categoryIdParamSchema.safeParse(params);

    if (!parsedParams.success) {
      return errorResponse(400, "Invalid route params", parsedParams.error.flatten());
    }

    const { deleteAdminCategoryUseCase } = createCategoryManagementUseCases();
    const data = await deleteAdminCategoryUseCase.execute(actorId, parsedParams.data.id);

    return successResponse(data, 200, "Category deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
