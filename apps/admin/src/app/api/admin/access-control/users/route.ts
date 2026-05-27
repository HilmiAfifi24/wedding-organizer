import { createAccessControlUseCases } from "@/core/infrastructure/http/access-control-factory";
import { handleApiError, successResponse } from "@/core/infrastructure/http/route-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? undefined;

    const { listAccessUsersUseCase } = createAccessControlUseCases();
    const data = await listAccessUsersUseCase.execute(search);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
