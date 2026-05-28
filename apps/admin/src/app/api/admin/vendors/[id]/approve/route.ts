import { getAdminActorOrThrow } from "@/core/infrastructure/http/get-admin-actor";
import {
  errorResponse,
  handleApiError,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { createVendorManagementUseCases } from "@/core/infrastructure/http/vendors/vendor-management-factory";
import { vendorIdParamSchema } from "@/modules/vendors/schemas/vendor-management";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_: Request, context: RouteContext) {
  try {
    const { actorId } = await getAdminActorOrThrow();

    const params = await context.params;
    const parsedParams = vendorIdParamSchema.safeParse(params);
    if (!parsedParams.success) {
      return errorResponse(400, "Invalid route params", parsedParams.error.flatten());
    }

    const { approveVendorUseCase } = createVendorManagementUseCases();
    const data = await approveVendorUseCase.execute(actorId, parsedParams.data.id);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
