import "server-only";

import { auth } from "@/auth";
import { createUserAuthUseCases } from "@/core/infrastructure/http/user-auth-factory";

export const getCurrentUserSession = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const { getUserSessionUseCase } = createUserAuthUseCases();

  try {
    return await getUserSessionUseCase.execute(session.user.id);
  } catch {
    return null;
  }
};
