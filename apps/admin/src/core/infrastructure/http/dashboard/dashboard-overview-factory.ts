import {
  GetDashboardBookingsOverviewUseCase,
  GetDashboardOverviewUseCase,
  GetDashboardPaymentsOverviewUseCase,
  GetDashboardRecentActivitiesUseCase,
  GetDashboardReviewsOverviewUseCase,
  GetDashboardVendorsOverviewUseCase,
} from "@/core/application/use-cases/dashboard";
import { PrismaDashboardOverviewRepository } from "@/core/infrastructure/db/repositories";

export const createDashboardOverviewUseCases = () => {
  const repository = new PrismaDashboardOverviewRepository();

  return {
    getDashboardOverviewUseCase: new GetDashboardOverviewUseCase(repository),
    getDashboardBookingsOverviewUseCase: new GetDashboardBookingsOverviewUseCase(repository),
    getDashboardVendorsOverviewUseCase: new GetDashboardVendorsOverviewUseCase(repository),
    getDashboardPaymentsOverviewUseCase: new GetDashboardPaymentsOverviewUseCase(repository),
    getDashboardReviewsOverviewUseCase: new GetDashboardReviewsOverviewUseCase(repository),
    getDashboardRecentActivitiesUseCase: new GetDashboardRecentActivitiesUseCase(repository),
  };
};
