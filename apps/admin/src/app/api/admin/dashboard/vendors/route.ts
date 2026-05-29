import { getAdminActorOrThrow } from "@/core/infrastructure/http/get-admin-actor";
import { createDashboardOverviewUseCases } from "@/core/infrastructure/http/dashboard/dashboard-overview-factory";
import { handleApiError, successResponse } from "@/core/infrastructure/http/route-response";

export async function GET() {
  try {
    const { actorId } = await getAdminActorOrThrow();
    const { getDashboardVendorsOverviewUseCase } = createDashboardOverviewUseCases();
    const data = await getDashboardVendorsOverviewUseCase.execute(actorId);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
