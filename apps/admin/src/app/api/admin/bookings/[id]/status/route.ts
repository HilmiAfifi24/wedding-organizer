import { getAdminActorOrThrow } from "@/core/infrastructure/http/get-admin-actor";
import { createBookingManagementUseCases } from "@/core/infrastructure/http/bookings/booking-management-factory";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import {
  bookingIdParamSchema,
  updateBookingStatusBodySchema,
} from "@/modules/bookings/schemas/booking-management";

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { actorId } = await getAdminActorOrThrow();
    const params = await context.params;

    const parsedParams = bookingIdParamSchema.safeParse(params);
    if (!parsedParams.success) {
      return errorResponse(400, "Invalid route params", parsedParams.error.flatten());
    }

    const body = await parseJsonBody<unknown>(request);
    const parsedBody = updateBookingStatusBodySchema.safeParse(body);
    if (!parsedBody.success) {
      return errorResponse(400, "Invalid request body", parsedBody.error.flatten());
    }

    const { updateAdminBookingStatusUseCase } = createBookingManagementUseCases();
    const data = await updateAdminBookingStatusUseCase.execute(
      actorId,
      parsedParams.data.id,
      parsedBody.data
    );

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
