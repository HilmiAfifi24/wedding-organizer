import { createUserAuthUseCases } from "@/core/infrastructure/http/user-auth-factory";
import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { loginSchema } from "@/modules/auth/schemas/auth";

const authenticationMessageByReason = {
  INVALID_CREDENTIALS: "Email atau password salah",
  FORBIDDEN_ROLE: "Hanya akun USER yang dapat login ke User App",
  ACCOUNT_SUSPENDED: "Akun Anda sedang disuspend",
  ACCOUNT_DELETED: "Akun Anda tidak tersedia",
} as const;

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody<unknown>(request);
    const parsed = loginSchema.safeParse(payload);

    if (!parsed.success) {
      return errorResponse(400, "Invalid request body", parsed.error.flatten());
    }

    const { authenticateUserUseCase } = createUserAuthUseCases();
    const result = await authenticateUserUseCase.execute(parsed.data.email, parsed.data.password);

    if (!result.success) {
      const status = result.reason === "INVALID_CREDENTIALS" ? 401 : 403;
      return errorResponse(status, authenticationMessageByReason[result.reason]);
    }

    return successResponse(result.session, 200, "User authenticated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
