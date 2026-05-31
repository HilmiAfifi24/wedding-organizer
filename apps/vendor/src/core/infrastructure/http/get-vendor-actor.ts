import "server-only";

import { auth } from "@/auth";
import { createVendorAuthUseCases } from "@/core/infrastructure/http/vendor-auth-factory";

export const getVendorActorOrThrow = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized: no active vendor session");
  }

  if (session.user.role !== "VENDOR") {
    throw new Error("Forbidden: vendor access only");
  }

  const { getVendorSessionUseCase } = createVendorAuthUseCases();
  const vendorSession = await getVendorSessionUseCase.execute(session.user.id);

  return {
    actorId: vendorSession.userId,
    vendorId: vendorSession.vendorId,
    vendorSession,
  };
};
