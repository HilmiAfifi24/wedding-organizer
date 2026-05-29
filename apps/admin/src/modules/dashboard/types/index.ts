import type {
  AdminDashboardBookingsOverviewDTO,
  AdminDashboardOverviewDTO,
  AdminDashboardPaymentsOverviewDTO,
  AdminDashboardReviewsOverviewDTO,
  AdminDashboardVendorsOverviewDTO,
  DashboardRecentActivityDTO,
  DashboardTimeRange,
} from "@wo/shared-types";

export interface DashboardOverviewFilters {
  timeRange: DashboardTimeRange;
}

export type DashboardOverviewResult = AdminDashboardOverviewDTO;
export type DashboardBookingsOverviewResult = AdminDashboardBookingsOverviewDTO;
export type DashboardVendorsOverviewResult = AdminDashboardVendorsOverviewDTO;
export type DashboardPaymentsOverviewResult = AdminDashboardPaymentsOverviewDTO;
export type DashboardReviewsOverviewResult = AdminDashboardReviewsOverviewDTO;
export type DashboardRecentActivitiesResult = DashboardRecentActivityDTO[];
