import { getAdminActorOrThrow } from "@/core/infrastructure/http/get-admin-actor";
import { createReviewModerationUseCases } from "@/core/infrastructure/http/reviews/review-moderation-factory";
import { errorResponse, handleApiError, successResponse } from "@/core/infrastructure/http/route-response";
import { reviewIdParamSchema } from "@/modules/reviews/schemas/review-moderation";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { actorId } = await getAdminActorOrThrow();
    const params = await context.params;
    const parsedParams = reviewIdParamSchema.safeParse(params);

    if (!parsedParams.success) {
      return errorResponse(400, "Invalid route params", parsedParams.error.flatten());
    }

    const { getAdminReviewHistoryUseCase } = createReviewModerationUseCases();
    const data = await getAdminReviewHistoryUseCase.execute(actorId, parsedParams.data.id);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
