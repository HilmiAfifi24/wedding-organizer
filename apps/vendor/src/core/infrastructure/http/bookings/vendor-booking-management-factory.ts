import {
  GetVendorBookingDetailUseCase,
  GetVendorBookingHistoryUseCase,
  ListVendorBookingsUseCase,
  UpdateVendorBookingStatusUseCase,
} from "@/core/application/use-cases/bookings/vendor-booking-management-use-cases";
import { PrismaVendorBookingManagementRepository } from "@/core/infrastructure/db/repositories";

export const createVendorBookingManagementUseCases = () => {
  const repository = new PrismaVendorBookingManagementRepository();

  return {
    listVendorBookingsUseCase: new ListVendorBookingsUseCase(repository),
    getVendorBookingDetailUseCase: new GetVendorBookingDetailUseCase(repository),
    getVendorBookingHistoryUseCase: new GetVendorBookingHistoryUseCase(repository),
    updateVendorBookingStatusUseCase: new UpdateVendorBookingStatusUseCase(repository),
  };
};
