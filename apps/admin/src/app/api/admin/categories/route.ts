import { createCategoryManagementUseCases } from "@/core/infrastructure/http/categories/category-management-factory";
import { getAdminActorOrThrow } from "@/core/infrastructure/http/get-admin-actor";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import {
  categoryListQuerySchema,
  createCategoryBodySchema,
} from "@/modules/categories/schemas/category-management";

export async function GET(request: Request) {
  try {
    const { actorId } = await getAdminActorOrThrow();

    const url = new URL(request.url);
    const rawQuery = Object.fromEntries(url.searchParams.entries());
    const parsed = categoryListQuerySchema.safeParse(rawQuery);

    if (!parsed.success) {
      return errorResponse(400, "Invalid query params", parsed.error.flatten());
    }

    const { listAdminCategoriesUseCase } = createCategoryManagementUseCases();
    const data = await listAdminCategoriesUseCase.execute(actorId, parsed.data);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { actorId } = await getAdminActorOrThrow();
    const payload = await parseJsonBody<unknown>(request);
    const parsed = createCategoryBodySchema.safeParse(payload);

    if (!parsed.success) {
      return errorResponse(400, "Invalid request body", parsed.error.flatten());
    }

    const { createAdminCategoryUseCase } = createCategoryManagementUseCases();
    const data = await createAdminCategoryUseCase.execute(actorId, parsed.data);

    return successResponse(data, 201, "Category created successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
