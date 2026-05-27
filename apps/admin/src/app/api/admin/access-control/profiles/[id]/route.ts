import { createAccessControlUseCases } from "@/core/infrastructure/http/access-control-factory";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { updateAccessProfileSchema } from "@/modules/access-control/validators/access-control";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = await parseJsonBody<unknown>(request);
    const parsed = updateAccessProfileSchema.safeParse(payload);
    if (!parsed.success) {
      return errorResponse(400, "Invalid payload", parsed.error.flatten());
    }

    const { updateAccessProfileUseCase } = createAccessControlUseCases();
    const updated = await updateAccessProfileUseCase.execute(id, parsed.data);

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { deleteAccessProfileUseCase } = createAccessControlUseCases();

    await deleteAccessProfileUseCase.execute(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
