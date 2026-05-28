import {
  GetAdminBookingDetailUseCase,
  GetAdminBookingHistoryUseCase,
  ListAdminBookingsUseCase,
  UpdateAdminBookingStatusUseCase,
} from "@/core/application/use-cases/bookings";
import { PrismaBookingManagementRepository } from "@/core/infrastructure/db/repositories";

export const createBookingManagementUseCases = () => {
  const repository = new PrismaBookingManagementRepository();

  return {
    listAdminBookingsUseCase: new ListAdminBookingsUseCase(repository),
    getAdminBookingDetailUseCase: new GetAdminBookingDetailUseCase(repository),
    getAdminBookingHistoryUseCase: new GetAdminBookingHistoryUseCase(repository),
    updateAdminBookingStatusUseCase: new UpdateAdminBookingStatusUseCase(repository),
  };
};
