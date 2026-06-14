import {
  CreateUserBookingUseCase,
  GetUserBookingDetailUseCase,
  GetUserBookingTimelineUseCase,
  ListUserBookingsUseCase,
} from "@/core/application/use-cases/user-booking-use-cases";
import { PrismaBookingRepository } from "@/core/infrastructure/db/repositories";

export const createUserBookingUseCases = () => {
  const repository = new PrismaBookingRepository();

  return {
    repository,
    createUserBookingUseCase: new CreateUserBookingUseCase(repository),
    getUserBookingDetailUseCase: new GetUserBookingDetailUseCase(repository),
    getUserBookingTimelineUseCase: new GetUserBookingTimelineUseCase(repository),
    listUserBookingsUseCase: new ListUserBookingsUseCase(repository),
  };
};
