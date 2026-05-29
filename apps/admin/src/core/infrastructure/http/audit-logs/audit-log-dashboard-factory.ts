import {
  GetAdminAuditLogDetailUseCase,
  ListAdminAuditLogsUseCase,
} from "@/core/application/use-cases/audit-logs";
import { PrismaAuditLogDashboardRepository } from "@/core/infrastructure/db/repositories";

export const createAuditLogDashboardUseCases = () => {
  const repository = new PrismaAuditLogDashboardRepository();

  return {
    listAdminAuditLogsUseCase: new ListAdminAuditLogsUseCase(repository),
    getAdminAuditLogDetailUseCase: new GetAdminAuditLogDetailUseCase(repository),
  };
};
