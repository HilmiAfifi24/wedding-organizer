import { getAdminActorOrThrow } from "@/core/infrastructure/http/get-admin-actor";
import { createAuditLogDashboardUseCases } from "@/core/infrastructure/http/audit-logs/audit-log-dashboard-factory";
import { errorResponse, handleApiError, successResponse } from "@/core/infrastructure/http/route-response";
import { auditLogIdParamSchema } from "@/modules/audit-logs/schemas/audit-log-dashboard";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { actorId } = await getAdminActorOrThrow();
    const params = await context.params;
    const parsedParams = auditLogIdParamSchema.safeParse(params);

    if (!parsedParams.success) {
      return errorResponse(400, "Invalid route params", parsedParams.error.flatten());
    }

    const { getAdminAuditLogDetailUseCase } = createAuditLogDashboardUseCases();
    const data = await getAdminAuditLogDetailUseCase.execute(actorId, parsedParams.data.id);

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
