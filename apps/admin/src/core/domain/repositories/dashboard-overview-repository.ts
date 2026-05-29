import type {
  AdminDashboardBookingsOverviewDTO,
  AdminDashboardPaymentsOverviewDTO,
  AdminDashboardReviewsOverviewDTO,
  AdminDashboardVendorsOverviewDTO,
  DashboardKpiSummaryDTO,
  DashboardRecentActivityDTO,
} from "@wo/shared-types";

import type { DashboardDateRange, DashboardPermissionMap } from "@/core/domain/entities/dashboard-overview";

export interface DashboardOverviewRepository {
  getActorDashboardPermissions(actorId: string): Promise<DashboardPermissionMap>;
  getKpiSummary(): Promise<DashboardKpiSummaryDTO[]>;
  getBookingsOverview(range: DashboardDateRange): Promise<AdminDashboardBookingsOverviewDTO>;
  getVendorsOverview(): Promise<AdminDashboardVendorsOverviewDTO>;
  getPaymentsOverview(range: DashboardDateRange): Promise<AdminDashboardPaymentsOverviewDTO>;
  getReviewsOverview(range: DashboardDateRange): Promise<AdminDashboardReviewsOverviewDTO>;
  listRecentActivities(limit: number): Promise<DashboardRecentActivityDTO[]>;
}
