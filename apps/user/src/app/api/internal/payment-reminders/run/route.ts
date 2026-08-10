import { createPaymentReminderUseCases } from "@/core/infrastructure/http/payment-reminder-factory";
import { errorResponse, handleApiError, successResponse } from "@/core/infrastructure/http/route-response";

const isAuthorized = (request: Request) => {
  const authorization = request.headers.get("authorization");
  const expectedTokens = [process.env.INTERNAL_CRON_TOKEN, process.env.CRON_SECRET].filter(
    (value): value is string => Boolean(value)
  );

  if (!expectedTokens.length || !authorization?.startsWith("Bearer ")) {
    return false;
  }

  const providedToken = authorization.slice("Bearer ".length);

  return expectedTokens.includes(providedToken);
};

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return errorResponse(401, "Unauthorized: invalid internal cron token");
    }

    const { runPaymentRemindersUseCase } = createPaymentReminderUseCases();
    const result = await runPaymentRemindersUseCase.execute(new Date());

    return successResponse(result, 200, "Payment reminders processed");
  } catch (error) {
    return handleApiError(error);
  }
}
