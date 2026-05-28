import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/core/infrastructure/db/prisma";

export const requireAdminSession = async () => {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
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

  if (!user || user.role !== "ADMIN" || user.suspendedAt || user.deletedAt) {
    redirect("/login");
  }

  return session;
};
