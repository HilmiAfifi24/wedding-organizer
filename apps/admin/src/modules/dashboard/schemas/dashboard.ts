import { DashboardTimeRange } from "@wo/shared-types";
import { z } from "zod";

export const dashboardOverviewQuerySchema = z.object({
  timeRange: z.nativeEnum(DashboardTimeRange).default(DashboardTimeRange.LAST_30_DAYS),
});

export type DashboardOverviewQueryInput = z.infer<typeof dashboardOverviewQuerySchema>;
