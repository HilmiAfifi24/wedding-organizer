import { createVendorBookingManagementUseCases } from "@/core/infrastructure/http/bookings/vendor-booking-management-factory";
import { getVendorActorOrThrow } from "@/core/infrastructure/http/get-vendor-actor";
import {
  errorResponse,
  handleApiError,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { bookingIdParamSchema } from "@/modules/bookings/schemas/booking-management";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { vendorId } = await getVendorActorOrThrow();
    const params = await context.params;
    const parsedParams = bookingIdParamSchema.safeParse(params);

    if (!parsedParams.success) {
      return errorResponse(400, "Invalid route params", parsedParams.error.flatten());
    }

    const { getVendorBookingHistoryUseCase } = createVendorBookingManagementUseCases();
    const data = await getVendorBookingHistoryUseCase.execute(vendorId, parsedParams.data.id);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
