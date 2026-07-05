import { createAdatManagementUseCases } from "@/core/infrastructure/http/adats/adat-management-factory";
import { getAdminActorOrThrow } from "@/core/infrastructure/http/get-admin-actor";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import {
  adatListQuerySchema,
  createAdatBodySchema,
} from "@/modules/adats/schemas/adat-management";

export async function GET(request: Request) {
  try {
    const { actorId } = await getAdminActorOrThrow();

    const url = new URL(request.url);
    const rawQuery = Object.fromEntries(url.searchParams.entries());
    const parsed = adatListQuerySchema.safeParse(rawQuery);

    if (!parsed.success) {
      return errorResponse(400, "Invalid query params", parsed.error.flatten());
    }

    const { listAdminAdatsUseCase } = createAdatManagementUseCases();
    const data = await listAdminAdatsUseCase.execute(actorId, parsed.data);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { actorId } = await getAdminActorOrThrow();
    const payload = await parseJsonBody<unknown>(request);
    const parsed = createAdatBodySchema.safeParse(payload);

    if (!parsed.success) {
      return errorResponse(400, "Invalid request body", parsed.error.flatten());
    }

    const { createAdminAdatUseCase } = createAdatManagementUseCases();
    const data = await createAdminAdatUseCase.execute(actorId, parsed.data);

    return successResponse(data, 201, "Adat created successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
