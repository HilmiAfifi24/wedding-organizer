import { getAdminActorOrThrow } from "@/core/infrastructure/http/get-admin-actor";
import { createBookingManagementUseCases } from "@/core/infrastructure/http/bookings/booking-management-factory";
import { errorResponse, handleApiError, successResponse } from "@/core/infrastructure/http/route-response";
import { bookingIdParamSchema } from "@/modules/bookings/schemas/booking-management";

export async function GET(
  _request: Request,
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

    const { getAdminBookingHistoryUseCase } = createBookingManagementUseCases();
    const data = await getAdminBookingHistoryUseCase.execute(actorId, parsedParams.data.id);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
