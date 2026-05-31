import { createVendorAuthUseCases } from "@/core/infrastructure/http/vendor-auth-factory";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { registerSchema } from "@/modules/auth/schemas/auth";

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody<unknown>(request);
    const parsed = registerSchema.safeParse(payload);

    if (!parsed.success) {
      return errorResponse(400, "Invalid request body", parsed.error.flatten());
    }

    const { registerVendorUseCase } = createVendorAuthUseCases();
    const data = await registerVendorUseCase.execute(parsed.data);

    return successResponse(data, 201, "Vendor registered successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
