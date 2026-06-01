import { createVendorBookingManagementUseCases } from "@/core/infrastructure/http/bookings/vendor-booking-management-factory";
import { getVendorActorOrThrow } from "@/core/infrastructure/http/get-vendor-actor";
import {
  errorResponse,
  handleApiError,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { vendorBookingListQuerySchema } from "@/modules/bookings/schemas/booking-management";

export async function GET(request: Request) {
  try {
    const { vendorId } = await getVendorActorOrThrow();

    const url = new URL(request.url);
    const rawQuery = Object.fromEntries(url.searchParams.entries());
    const parsed = vendorBookingListQuerySchema.safeParse(rawQuery);

    if (!parsed.success) {
      return errorResponse(400, "Invalid query params", parsed.error.flatten());
    }

    const { listVendorBookingsUseCase } = createVendorBookingManagementUseCases();
    const data = await listVendorBookingsUseCase.execute(vendorId, parsed.data);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
