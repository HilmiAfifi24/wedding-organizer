import type { SetAccessPermissionInput } from "@wo/shared-types";

import { createAccessControlUseCases } from "@/core/infrastructure/http/access-control-factory";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type SetPermissionsPayload = {
  permissions: SetAccessPermissionInput[];
};

const isValidPermissionsPayload = (value: SetAccessPermissionInput[]) =>
  value.every(
    (permission) =>
      typeof permission.accessMenuId === "string" &&
      (!permission.customEvents || permission.customEvents.every((event) => typeof event === "string"))
  );

export async function GET(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { getAccessProfilePermissionsUseCase } = createAccessControlUseCases();

    const data = await getAccessProfilePermissionsUseCase.execute(id);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = await parseJsonBody<SetPermissionsPayload | SetAccessPermissionInput[]>(request);

    const permissions = Array.isArray(payload) ? payload : payload.permissions;
    if (!Array.isArray(permissions) || !isValidPermissionsPayload(permissions)) {
      return errorResponse(400, "Invalid permissions payload");
    }

    const { setAccessProfilePermissionsUseCase } = createAccessControlUseCases();
    const data = await setAccessProfilePermissionsUseCase.execute(id, permissions);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
