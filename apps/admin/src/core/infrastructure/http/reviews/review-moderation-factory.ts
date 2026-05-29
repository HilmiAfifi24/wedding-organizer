import {
  GetAdminReviewDetailUseCase,
  GetAdminReviewHistoryUseCase,
  HideReviewUseCase,
  ListAdminReviewsUseCase,
  SoftDeleteReviewUseCase,
  UnhideReviewUseCase,
} from "@/core/application/use-cases/reviews";
import { PrismaReviewModerationRepository } from "@/core/infrastructure/db/repositories";

export const createReviewModerationUseCases = () => {
  const repository = new PrismaReviewModerationRepository();

  return {
    listAdminReviewsUseCase: new ListAdminReviewsUseCase(repository),
    getAdminReviewDetailUseCase: new GetAdminReviewDetailUseCase(repository),
    getAdminReviewHistoryUseCase: new GetAdminReviewHistoryUseCase(repository),
    hideReviewUseCase: new HideReviewUseCase(repository),
    unhideReviewUseCase: new UnhideReviewUseCase(repository),
    softDeleteReviewUseCase: new SoftDeleteReviewUseCase(repository),
  };
};
