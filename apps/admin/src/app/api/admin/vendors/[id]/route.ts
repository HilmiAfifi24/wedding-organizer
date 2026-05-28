import { getAdminActorOrThrow } from "@/core/infrastructure/http/get-admin-actor";
import {
  errorResponse,
  handleApiError,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { createVendorManagementUseCases } from "@/core/infrastructure/http/vendors/vendor-management-factory";
import {
  vendorDetailQuerySchema,
  vendorIdParamSchema,
} from "@/modules/vendors/schemas/vendor-management";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { actorId } = await getAdminActorOrThrow();

    const params = await context.params;
    const parsedParams = vendorIdParamSchema.safeParse(params);
    if (!parsedParams.success) {
      return errorResponse(400, "Invalid route params", parsedParams.error.flatten());
    }

    const url = new URL(request.url);
    const rawQuery = Object.fromEntries(url.searchParams.entries());
    const parsedQuery = vendorDetailQuerySchema.safeParse(rawQuery);

    if (!parsedQuery.success) {
      return errorResponse(400, "Invalid query params", parsedQuery.error.flatten());
    }

    const { getAdminVendorDetailUseCase } = createVendorManagementUseCases();
    const data = await getAdminVendorDetailUseCase.execute(
      actorId,
      parsedParams.data.id,
      parsedQuery.data
    );

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { actorId } = await getAdminActorOrThrow();

    const params = await context.params;
    const parsedParams = vendorIdParamSchema.safeParse(params);
    if (!parsedParams.success) {
      return errorResponse(400, "Invalid route params", parsedParams.error.flatten());
    }

    const { softDeleteVendorUseCase } = createVendorManagementUseCases();
    const data = await softDeleteVendorUseCase.execute(actorId, parsedParams.data.id);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
