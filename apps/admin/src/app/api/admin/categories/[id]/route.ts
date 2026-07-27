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
  console.log("PATCH /api/admin/categories/[id] route handler called");
  try {
    const { actorId } = await getAdminActorOrThrow();
    console.log("Actor ID retrieved:", actorId);
    const params = await context.params;
    const parsedParams = categoryIdParamSchema.safeParse(params);

    if (!parsedParams.success) {
      console.log("Category route param validation failed:", parsedParams.error.flatten());
      return errorResponse(400, "Invalid route params", parsedParams.error.flatten());
    }
    console.log("Route parameters parsed successfully:", parsedParams.data);

    const payload = await parseJsonBody<unknown>(request);
    const parsedBody = updateCategoryBodySchema.safeParse(payload);

    if (!parsedBody.success) {
      console.log("Category request body validation failed:", parsedBody.error.flatten());
      return errorResponse(400, "Invalid request body", parsedBody.error.flatten());
    }
    console.log("Request body parsed successfully:", parsedBody.data);

    const { updateAdminCategoryUseCase } = createCategoryManagementUseCases();
    console.log("Executing updateAdminCategoryUseCase...");
    const data = await updateAdminCategoryUseCase.execute(
      actorId,
      parsedParams.data.id,
      parsedBody.data
    );
    console.log("Update database query successful. Result:", data);

    return successResponse(data, 200, "Category updated successfully");
  } catch (error) {
    console.error("PATCH Category error caught in route handler:", error);
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
