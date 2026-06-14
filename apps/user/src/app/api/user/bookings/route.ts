import { parseBookingEventDate } from "@/modules/bookings/services/event-date";
import { createBookingSchema } from "@/modules/bookings/schemas/create-booking";
import { getCurrentUserSession } from "@/modules/auth/services/current-user-session";
import { createUserBookingUseCases } from "@/core/infrastructure/http/user-booking-factory";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";

export async function POST(request: Request) {
  try {
    const session = await getCurrentUserSession();

    if (!session) {
      return errorResponse(401, "Unauthorized: user session not found");
    }

    const payload = await parseJsonBody<unknown>(request);
    const parsed = createBookingSchema.safeParse(payload);

    if (!parsed.success) {
      return errorResponse(400, "Invalid request body", parsed.error.flatten());
    }

    const { createUserBookingUseCase } = createUserBookingUseCases();
    const data = await createUserBookingUseCase.execute(
      {
        ...parsed.data,
        eventDate: parseBookingEventDate(parsed.data.eventDate),
      },
      session
    );

    return successResponse(data, 201, "Success");
  } catch (error) {
    return handleApiError(error);
  }
}
