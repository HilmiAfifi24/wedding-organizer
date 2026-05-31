import { createReviewModerationUseCases } from "@/core/infrastructure/http/reviews/review-moderation-factory";
import { getEffectiveNavigationForUser } from "@/modules/access-control/services/get-effective-navigation";
import { requireAdminSession } from "@/modules/auth/services/require-admin-session";
import { ReviewsManagementDashboard } from "@/modules/reviews/components/reviews-management-dashboard";
import type { ReviewModerationInitialState } from "@/modules/reviews/hooks/use-review-moderation";
import { reviewListQuerySchema } from "@/modules/reviews/schemas/review-moderation";
import { AdminLayout } from "@/shared/components/admin-layout";

export default async function ReviewsPage() {
  const session = await requireAdminSession();
  const parsedQuery = reviewListQuerySchema.parse({});
  const { listAdminReviewsUseCase } = createReviewModerationUseCases();
  const [navigation, initialList] = await Promise.all([
    getEffectiveNavigationForUser(session.user.id),
    listAdminReviewsUseCase.execute(session.user.id, parsedQuery),
  ]);
  const initialState: ReviewModerationInitialState = {
    list: initialList,
    queryState: {
      page: parsedQuery.page,
      pageSize: parsedQuery.pageSize,
      filters: {
        search: parsedQuery.search,
        status: parsedQuery.status ?? "ALL",
        rating: parsedQuery.rating ?? "ALL",
        vendor: parsedQuery.vendor,
        sortBy: parsedQuery.sortBy,
        sortDirection: parsedQuery.sortDirection,
      },
    },
  };

  return (
    <AdminLayout user={session.user} navigation={navigation}>
      <ReviewsManagementDashboard initialState={initialState} />
    </AdminLayout>
  );
}
