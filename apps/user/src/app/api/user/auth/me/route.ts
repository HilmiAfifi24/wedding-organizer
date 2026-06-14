import { auth } from "@/auth";
import { createUserAuthUseCases } from "@/core/infrastructure/http/user-auth-factory";
import { handleApiError, successResponse } from "@/core/infrastructure/http/route-response";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized: user session not found");
    }

    const { getUserSessionUseCase } = createUserAuthUseCases();
    const data = await getUserSessionUseCase.execute(session.user.id);

    return successResponse(data, 200, "Success");
  } catch (error) {
    return handleApiError(error);
  }
}
