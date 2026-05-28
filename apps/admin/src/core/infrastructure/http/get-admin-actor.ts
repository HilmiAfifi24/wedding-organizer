import "server-only";

import { auth } from "@/auth";
import { prisma } from "@/core/infrastructure/db/prisma";

export const getAdminActorOrThrow = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized: no active session");
  }

  if (session.user.role !== "ADMIN") {
    throw new Error("Forbidden: admin access only");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      suspendedAt: true,
      deletedAt: true,
    },
  });

  if (!user || user.role !== "ADMIN") {
    throw new Error("Forbidden: admin access only");
  }

  if (user.deletedAt || user.suspendedAt) {
    throw new Error("Unauthorized: admin account is inactive");
  }

  return {
    actorId: session.user.id,
    session,
  };
};
