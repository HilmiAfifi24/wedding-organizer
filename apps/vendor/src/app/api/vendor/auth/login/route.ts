import { createVendorAuthUseCases } from "@/core/infrastructure/http/vendor-auth-factory";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { loginSchema } from "@/modules/auth/schemas/auth";

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody<unknown>(request);
    const parsed = loginSchema.safeParse(payload);

    if (!parsed.success) {
      return errorResponse(400, "Invalid request body", parsed.error.flatten());
    }

    const { authenticateVendorUseCase } = createVendorAuthUseCases();
    const data = await authenticateVendorUseCase.execute(
      parsed.data.email,
      parsed.data.password
    );

    if (!data) {
      return errorResponse(
        401,
        "Email atau password salah, atau akun tidak memiliki akses vendor"
      );
    }

    return successResponse(data, 200, "Vendor authenticated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
