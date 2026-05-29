import { getAdminActorOrThrow } from "@/core/infrastructure/http/get-admin-actor";
import { createReviewModerationUseCases } from "@/core/infrastructure/http/reviews/review-moderation-factory";
import {
  errorResponse,
  handleApiError,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { reviewListQuerySchema } from "@/modules/reviews/schemas/review-moderation";

export async function GET(request: Request) {
  try {
    const { actorId } = await getAdminActorOrThrow();

    const url = new URL(request.url);
    const rawQuery = Object.fromEntries(url.searchParams.entries());
    const parsed = reviewListQuerySchema.safeParse(rawQuery);

    if (!parsed.success) {
      return errorResponse(400, "Invalid query params", parsed.error.flatten());
    }

    const { listAdminReviewsUseCase } = createReviewModerationUseCases();
    const data = await listAdminReviewsUseCase.execute(actorId, parsed.data);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
