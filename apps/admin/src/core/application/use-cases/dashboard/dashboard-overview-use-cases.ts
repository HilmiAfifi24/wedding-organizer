import type { DashboardTimeRange } from "@wo/shared-types";

import { DashboardAnalyticsService } from "@/core/application/services/dashboard/dashboard-analytics-service";
import type { DashboardOverviewRepository } from "@/core/domain/repositories";

export class GetDashboardOverviewUseCase {
  private readonly service: DashboardAnalyticsService;

  constructor(repository: DashboardOverviewRepository) {
    this.service = new DashboardAnalyticsService(repository);
  }

  async execute(actorId: string, timeRange: DashboardTimeRange) {
    return this.service.getOverview(actorId, timeRange);
  }
}

export class GetDashboardBookingsOverviewUseCase {
  private readonly service: DashboardAnalyticsService;

  constructor(repository: DashboardOverviewRepository) {
    this.service = new DashboardAnalyticsService(repository);
  }

  async execute(actorId: string, timeRange: DashboardTimeRange) {
    return this.service.getBookingsOverview(actorId, timeRange);
  }
}

export class GetDashboardVendorsOverviewUseCase {
  private readonly service: DashboardAnalyticsService;

  constructor(repository: DashboardOverviewRepository) {
    this.service = new DashboardAnalyticsService(repository);
  }

  async execute(actorId: string) {
    return this.service.getVendorsOverview(actorId);
  }
}

export class GetDashboardPaymentsOverviewUseCase {
  private readonly service: DashboardAnalyticsService;

  constructor(repository: DashboardOverviewRepository) {
    this.service = new DashboardAnalyticsService(repository);
  }

  async execute(actorId: string, timeRange: DashboardTimeRange) {
    return this.service.getPaymentsOverview(actorId, timeRange);
  }
}

export class GetDashboardReviewsOverviewUseCase {
  private readonly service: DashboardAnalyticsService;

  constructor(repository: DashboardOverviewRepository) {
    this.service = new DashboardAnalyticsService(repository);
  }

  async execute(actorId: string, timeRange: DashboardTimeRange) {
    return this.service.getReviewsOverview(actorId, timeRange);
  }
}

export class GetDashboardRecentActivitiesUseCase {
  private readonly service: DashboardAnalyticsService;

  constructor(repository: DashboardOverviewRepository) {
    this.service = new DashboardAnalyticsService(repository);
  }

  async execute(actorId: string) {
    return this.service.getRecentActivities(actorId);
  }
}
