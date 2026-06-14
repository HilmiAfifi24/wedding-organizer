import { getCurrentUserSession } from "@/modules/auth/services/current-user-session";
import { createUserPaymentUseCases } from "@/core/infrastructure/http/user-payment-factory";
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
    const { getUserBookingPaymentsUseCase } = createUserPaymentUseCases();
    const data = await getUserBookingPaymentsUseCase.execute(id, session);

    return successResponse(data, 200, "Success");
  } catch (error) {
    return handleApiError(error);
  }
}
