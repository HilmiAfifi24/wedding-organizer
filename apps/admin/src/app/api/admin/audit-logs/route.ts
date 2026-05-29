import { getAdminActorOrThrow } from "@/core/infrastructure/http/get-admin-actor";
import { createAuditLogDashboardUseCases } from "@/core/infrastructure/http/audit-logs/audit-log-dashboard-factory";
import {
  errorResponse,
  handleApiError,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { auditLogListQuerySchema } from "@/modules/audit-logs/schemas/audit-log-dashboard";

export async function GET(request: Request) {
  try {
    const { actorId } = await getAdminActorOrThrow();

    const url = new URL(request.url);
    const rawQuery = Object.fromEntries(url.searchParams.entries());
    const parsed = auditLogListQuerySchema.safeParse(rawQuery);

    if (!parsed.success) {
      return errorResponse(400, "Invalid query params", parsed.error.flatten());
    }

    const { listAdminAuditLogsUseCase } = createAuditLogDashboardUseCases();
    const data = await listAdminAuditLogsUseCase.execute(actorId, parsed.data);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
