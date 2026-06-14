import {
  errorResponse,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/core/infrastructure/http/route-response";
import { forgotPasswordSchema } from "@/modules/auth/schemas/auth";

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody<unknown>(request);
    const parsed = forgotPasswordSchema.safeParse(payload);

    if (!parsed.success) {
      return errorResponse(400, "Invalid request body", parsed.error.flatten());
    }

    return successResponse({}, 200, "Jika email terdaftar, instruksi reset akan dikirim");
  } catch (error) {
    return handleApiError(error);
  }
}
