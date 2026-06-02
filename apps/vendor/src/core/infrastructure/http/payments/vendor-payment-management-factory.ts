import {
  GetVendorPaymentProofDetailUseCase,
  GetVendorPaymentProofHistoryUseCase,
  ListVendorPaymentProofsUseCase,
  RejectVendorPaymentProofUseCase,
  VerifyVendorPaymentProofUseCase,
} from "@/core/application/use-cases/payments/vendor-payment-management-use-cases";
import { PrismaVendorPaymentManagementRepository } from "@/core/infrastructure/db/repositories";

export const createVendorPaymentManagementUseCases = () => {
  const repository = new PrismaVendorPaymentManagementRepository();

  return {
    listVendorPaymentProofsUseCase: new ListVendorPaymentProofsUseCase(repository),
    getVendorPaymentProofDetailUseCase: new GetVendorPaymentProofDetailUseCase(repository),
    getVendorPaymentProofHistoryUseCase: new GetVendorPaymentProofHistoryUseCase(repository),
    verifyVendorPaymentProofUseCase: new VerifyVendorPaymentProofUseCase(repository),
    rejectVendorPaymentProofUseCase: new RejectVendorPaymentProofUseCase(repository),
  };
};
