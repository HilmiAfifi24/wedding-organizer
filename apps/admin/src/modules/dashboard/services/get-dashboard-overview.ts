import "server-only";

import { DashboardTimeRange, type AdminDashboardOverviewDTO } from "@wo/shared-types";

import { createDashboardOverviewUseCases } from "@/core/infrastructure/http/dashboard/dashboard-overview-factory";

export const getDashboardOverview = async (
  actorId: string,
  timeRange: DashboardTimeRange = DashboardTimeRange.LAST_30_DAYS
): Promise<AdminDashboardOverviewDTO> => {
  const { getDashboardOverviewUseCase } = createDashboardOverviewUseCases();
  return getDashboardOverviewUseCase.execute(actorId, timeRange);
};
