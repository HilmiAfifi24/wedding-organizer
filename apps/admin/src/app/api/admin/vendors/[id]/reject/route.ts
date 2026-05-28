import { getAdminActorOrThrow } from "@/core/infrastructure/http/get-admin-actor";
import {
  errorResponse,
  handleApiError,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { createVendorManagementUseCases } from "@/core/infrastructure/http/vendors/vendor-management-factory";
import {
  rejectVendorBodySchema,
  vendorIdParamSchema,
} from "@/modules/vendors/schemas/vendor-management";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const parseJsonBody = async (request: Request): Promise<unknown> => {
  try {
    return (await request.json()) as unknown;
  } catch {
    throw new Error("Invalid JSON body");
  }
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { actorId } = await getAdminActorOrThrow();

    const params = await context.params;
    const parsedParams = vendorIdParamSchema.safeParse(params);
    if (!parsedParams.success) {
      return errorResponse(400, "Invalid route params", parsedParams.error.flatten());
    }

    const body = await parseJsonBody(request);
    const parsedBody = rejectVendorBodySchema.safeParse(body);
    if (!parsedBody.success) {
      return errorResponse(400, "Invalid request body", parsedBody.error.flatten());
    }

    const { rejectVendorUseCase } = createVendorManagementUseCases();
    const data = await rejectVendorUseCase.execute(
      actorId,
      parsedParams.data.id,
      parsedBody.data.reason
    );

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
