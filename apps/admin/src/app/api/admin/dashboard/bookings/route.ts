import { getAdminActorOrThrow } from "@/core/infrastructure/http/get-admin-actor";
import { createDashboardOverviewUseCases } from "@/core/infrastructure/http/dashboard/dashboard-overview-factory";
import {
  errorResponse,
  handleApiError,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { dashboardOverviewQuerySchema } from "@/modules/dashboard/schemas/dashboard";

export async function GET(request: Request) {
  try {
    const { actorId } = await getAdminActorOrThrow();
    const url = new URL(request.url);
    const rawQuery = Object.fromEntries(url.searchParams.entries());
    const parsed = dashboardOverviewQuerySchema.safeParse(rawQuery);

    if (!parsed.success) {
      return errorResponse(400, "Invalid query params", parsed.error.flatten());
    }

    const { getDashboardBookingsOverviewUseCase } = createDashboardOverviewUseCases();
    const data = await getDashboardBookingsOverviewUseCase.execute(actorId, parsed.data.timeRange);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
