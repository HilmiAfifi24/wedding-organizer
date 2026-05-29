import { getAdminActorOrThrow } from "@/core/infrastructure/http/get-admin-actor";
import { createReviewModerationUseCases } from "@/core/infrastructure/http/reviews/review-moderation-factory";
import { errorResponse, handleApiError, successResponse } from "@/core/infrastructure/http/route-response";
import { moderationReasonBodySchema, reviewIdParamSchema } from "@/modules/reviews/schemas/review-moderation";
import { parseJsonBody } from "@/core/infrastructure/http/route-response";

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

    const { getAdminReviewDetailUseCase } = createReviewModerationUseCases();
    const data = await getAdminReviewDetailUseCase.execute(actorId, parsedParams.data.id);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
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

    const body = await parseJsonBody<unknown>(request);
    const parsedBody = moderationReasonBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return errorResponse(400, "Invalid request body", parsedBody.error.flatten());
    }

    const { softDeleteReviewUseCase } = createReviewModerationUseCases();
    const data = await softDeleteReviewUseCase.execute(
      actorId,
      parsedParams.data.id,
      parsedBody.data.reason
    );

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
