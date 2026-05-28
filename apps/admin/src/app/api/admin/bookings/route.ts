import { getAdminActorOrThrow } from "@/core/infrastructure/http/get-admin-actor";
import { createBookingManagementUseCases } from "@/core/infrastructure/http/bookings/booking-management-factory";
import {
  errorResponse,
  handleApiError,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { bookingListQuerySchema } from "@/modules/bookings/schemas/booking-management";

export async function GET(request: Request) {
  try {
    const { actorId } = await getAdminActorOrThrow();

    const url = new URL(request.url);
    const rawQuery = Object.fromEntries(url.searchParams.entries());
    const parsed = bookingListQuerySchema.safeParse(rawQuery);

    if (!parsed.success) {
      return errorResponse(400, "Invalid query params", parsed.error.flatten());
    }

    const { listAdminBookingsUseCase } = createBookingManagementUseCases();
    const data = await listAdminBookingsUseCase.execute(actorId, parsed.data);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
