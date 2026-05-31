import { signOut } from "@/auth";
import { handleApiError, successResponse } from "@/core/infrastructure/http/route-response";

export async function POST() {
  try {
    await signOut({
      redirect: false,
    });

    return successResponse({}, 200, "Logout successful");
  } catch (error) {
    return handleApiError(error);
  }
}
