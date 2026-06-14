import { getCurrentUserSession } from "@/modules/auth/services/current-user-session";
import { bookingDetailParamSchema } from "@/modules/bookings/schemas/tracking";
import { createUserBookingUseCases } from "@/core/infrastructure/http/user-booking-factory";
import { errorResponse, handleApiError, successResponse } from "@/core/infrastructure/http/route-response";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const session = await getCurrentUserSession();

    if (!session) {
      return errorResponse(401, "Unauthorized: user session not found");
    }

    const parsedParams = bookingDetailParamSchema.safeParse(await context.params);
    if (!parsedParams.success) {
      return errorResponse(400, "Invalid route parameters", parsedParams.error.flatten());
    }

    const { getUserBookingTimelineUseCase } = createUserBookingUseCases();
    const data = await getUserBookingTimelineUseCase.execute(parsedParams.data.id, session);

    return successResponse(data, 200, "Success");
  } catch (error) {
    return handleApiError(error);
  }
}
