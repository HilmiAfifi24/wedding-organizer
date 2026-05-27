import { createAccessControlUseCases } from "@/core/infrastructure/http/access-control-factory";
import { handleApiError, successResponse } from "@/core/infrastructure/http/route-response";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { getUserAccessMenuTreeUseCase } = createAccessControlUseCases();

    const data = await getUserAccessMenuTreeUseCase.execute(id);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
