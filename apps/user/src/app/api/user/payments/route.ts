import { getCurrentUserSession } from "@/modules/auth/services/current-user-session";
import { paymentQuerySchema } from "@/modules/payments/schemas/payment-upload";
import { createUserPaymentUseCases } from "@/core/infrastructure/http/user-payment-factory";
import { errorResponse, handleApiError, successResponse } from "@/core/infrastructure/http/route-response";

export async function GET(request: Request) {
  try {
    const session = await getCurrentUserSession();

    if (!session) {
      return errorResponse(401, "Unauthorized: user session not found");
    }

    const url = new URL(request.url);
    const rawQuery = Object.fromEntries(url.searchParams.entries());
    const parsed = paymentQuerySchema.safeParse(rawQuery);

    if (!parsed.success) {
      return errorResponse(400, "Invalid query parameters", parsed.error.flatten());
    }

    const { listUserPaymentsUseCase } = createUserPaymentUseCases();
    const data = await listUserPaymentsUseCase.execute(parsed.data, session);

    return successResponse(data, 200, "Success");
  } catch (error) {
    return handleApiError(error);
  }
}
