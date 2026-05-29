import { getAdminActorOrThrow } from "@/core/infrastructure/http/get-admin-actor";
import { createReviewModerationUseCases } from "@/core/infrastructure/http/reviews/review-moderation-factory";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { reviewIdParamSchema, unhideReviewBodySchema } from "@/modules/reviews/schemas/review-moderation";

export async function PATCH(
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
    const parsedBody = unhideReviewBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return errorResponse(400, "Invalid request body", parsedBody.error.flatten());
    }

    const { unhideReviewUseCase } = createReviewModerationUseCases();
    const data = await unhideReviewUseCase.execute(
      actorId,
      parsedParams.data.id,
      parsedBody.data.reason
    );

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
