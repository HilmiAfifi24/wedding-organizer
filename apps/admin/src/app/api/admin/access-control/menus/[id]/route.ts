import { createAccessControlUseCases } from "@/core/infrastructure/http/access-control-factory";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { updateAccessMenuSchema } from "@/modules/access-control/validators/access-control";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = await parseJsonBody<unknown>(request);
    const parsed = updateAccessMenuSchema.safeParse(payload);
    if (!parsed.success) {
      return errorResponse(400, "Invalid payload", parsed.error.flatten());
    }

    if (parsed.data.parentId && parsed.data.parentId === id) {
      return errorResponse(400, "Menu parent cannot reference itself");
    }

    const { updateAccessMenuUseCase } = createAccessControlUseCases();
    const updated = await updateAccessMenuUseCase.execute(id, parsed.data);

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { deleteAccessMenuUseCase } = createAccessControlUseCases();

    await deleteAccessMenuUseCase.execute(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
