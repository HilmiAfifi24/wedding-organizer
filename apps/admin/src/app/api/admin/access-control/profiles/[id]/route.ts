import type { UpdateAccessProfileInput } from "@wo/shared-types";

import { createAccessControlUseCases } from "@/core/infrastructure/http/access-control-factory";
import {
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = await parseJsonBody<UpdateAccessProfileInput>(request);

    const { updateAccessProfileUseCase } = createAccessControlUseCases();
    const updated = await updateAccessProfileUseCase.execute(id, payload);

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
