import {
  ApproveVendorUseCase,
  GetAdminVendorDetailUseCase,
  ListAdminVendorsUseCase,
  RejectVendorUseCase,
  SoftDeleteVendorUseCase,
  SuspendVendorUseCase,
  UnsuspendVendorUseCase,
} from "@/core/application/use-cases/vendors";
import { PrismaVendorManagementRepository } from "@/core/infrastructure/db/repositories";

export const createVendorManagementUseCases = () => {
  const repository = new PrismaVendorManagementRepository();

  return {
    listAdminVendorsUseCase: new ListAdminVendorsUseCase(repository),
    getAdminVendorDetailUseCase: new GetAdminVendorDetailUseCase(repository),
    approveVendorUseCase: new ApproveVendorUseCase(repository),
    rejectVendorUseCase: new RejectVendorUseCase(repository),
    suspendVendorUseCase: new SuspendVendorUseCase(repository),
    unsuspendVendorUseCase: new UnsuspendVendorUseCase(repository),
    softDeleteVendorUseCase: new SoftDeleteVendorUseCase(repository),
  };
};
