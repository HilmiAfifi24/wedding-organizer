import type { CreateAccessProfileInput } from "@wo/shared-types";

import { createAccessControlUseCases } from "@/core/infrastructure/http/access-control-factory";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";

export async function GET() {
  try {
    const { listAccessProfilesUseCase } = createAccessControlUseCases();
    const data = await listAccessProfilesUseCase.execute();

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody<CreateAccessProfileInput>(request);

    if (!payload.code?.trim() || !payload.name?.trim()) {
      return errorResponse(400, "Field code and name are required");
    }

    const { createAccessProfileUseCase } = createAccessControlUseCases();
    const created = await createAccessProfileUseCase.execute({
      ...payload,
      code: payload.code.trim(),
      name: payload.name.trim(),
    });

    return successResponse(created, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
