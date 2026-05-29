import {
  ForceRejectPaymentProofUseCase,
  ForceVerifyPaymentProofUseCase,
  GetAdminPaymentProofDetailUseCase,
  GetAdminPaymentProofHistoryUseCase,
  ListAdminPaymentProofsUseCase,
} from "@/core/application/use-cases/payments";
import { PrismaPaymentMonitoringRepository } from "@/core/infrastructure/db/repositories";

export const createPaymentMonitoringUseCases = () => {
  const repository = new PrismaPaymentMonitoringRepository();

  return {
    listAdminPaymentProofsUseCase: new ListAdminPaymentProofsUseCase(repository),
    getAdminPaymentProofDetailUseCase: new GetAdminPaymentProofDetailUseCase(repository),
    getAdminPaymentProofHistoryUseCase: new GetAdminPaymentProofHistoryUseCase(repository),
    forceVerifyPaymentProofUseCase: new ForceVerifyPaymentProofUseCase(repository),
    forceRejectPaymentProofUseCase: new ForceRejectPaymentProofUseCase(repository),
  };
};
