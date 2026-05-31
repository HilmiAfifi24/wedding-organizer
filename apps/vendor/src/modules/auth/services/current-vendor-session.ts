import "server-only";

import { auth } from "@/auth";
import { createVendorAuthUseCases } from "@/core/infrastructure/http/vendor-auth-factory";

export const getCurrentVendorSession = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  if (session.user.role !== "VENDOR") {
    return null;
  }

  const { getVendorSessionUseCase } = createVendorAuthUseCases();

  try {
    return await getVendorSessionUseCase.execute(session.user.id);
  } catch {
    return null;
  }
};
