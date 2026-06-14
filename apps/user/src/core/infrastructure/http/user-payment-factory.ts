import {
  GetUserBookingPaymentsUseCase,
  GetUserPaymentProofDetailUseCase,
  GetUserPaymentTermUseCase,
  ListUserPaymentsUseCase,
  UploadUserPaymentProofUseCase,
} from "@/core/application/use-cases/user-payment-use-cases";
import { PrismaUserPaymentRepository } from "@/core/infrastructure/db/repositories";
import { DataUrlFileStorageService } from "@/core/infrastructure/storage/data-url-file-storage-service";

export const createUserPaymentUseCases = () => {
  const repository = new PrismaUserPaymentRepository();
  const fileStorage = new DataUrlFileStorageService();

  return {
    repository,
    fileStorage,
    listUserPaymentsUseCase: new ListUserPaymentsUseCase(repository),
    getUserPaymentProofDetailUseCase: new GetUserPaymentProofDetailUseCase(repository),
    getUserBookingPaymentsUseCase: new GetUserBookingPaymentsUseCase(repository),
    getUserPaymentTermUseCase: new GetUserPaymentTermUseCase(repository),
    uploadUserPaymentProofUseCase: new UploadUserPaymentProofUseCase(repository, fileStorage),
  };
};
