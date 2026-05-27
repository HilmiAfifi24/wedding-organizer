import type { CreateAccessMenuInput } from "@wo/shared-types";

import { createAccessControlUseCases } from "@/core/infrastructure/http/access-control-factory";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accessProfileId = searchParams.get("accessProfileId") ?? undefined;

    const { listAccessMenusUseCase } = createAccessControlUseCases();
    const data = await listAccessMenusUseCase.execute(accessProfileId);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody<CreateAccessMenuInput>(request);

    if (!payload.code?.trim() || !payload.name?.trim()) {
      return errorResponse(400, "Field code and name are required");
    }

    const { createAccessMenuUseCase } = createAccessControlUseCases();
    const created = await createAccessMenuUseCase.execute({
      ...payload,
      code: payload.code.trim(),
      name: payload.name.trim(),
    });

    return successResponse(created, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
