import type {
  AdminDashboardBookingsOverviewDTO,
  AdminDashboardOverviewDTO,
  AdminDashboardPaymentsOverviewDTO,
  AdminDashboardReviewsOverviewDTO,
  AdminDashboardVendorsOverviewDTO,
  DashboardRecentActivityDTO,
  DashboardTimeRange,
} from "@wo/shared-types";

export interface ParsedDashboardOverviewQuery {
  timeRange: DashboardTimeRange;
}

export type DashboardOverviewResponse = AdminDashboardOverviewDTO;
export type DashboardBookingsOverviewResponse = AdminDashboardBookingsOverviewDTO;
export type DashboardVendorsOverviewResponse = AdminDashboardVendorsOverviewDTO;
export type DashboardPaymentsOverviewResponse = AdminDashboardPaymentsOverviewDTO;
export type DashboardReviewsOverviewResponse = AdminDashboardReviewsOverviewDTO;
export type DashboardRecentActivitiesResponse = DashboardRecentActivityDTO[];
