import { getCurrentUserSession } from "@/modules/auth/services/current-user-session";
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

    const { id } = await context.params;
    const { getUserBookingDetailUseCase } = createUserBookingUseCases();
    const data = await getUserBookingDetailUseCase.execute(id, session);

    return successResponse(data, 200, "Success");
  } catch (error) {
    return handleApiError(error);
  }
}
