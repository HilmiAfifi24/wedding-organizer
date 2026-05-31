import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getAdminUserState } from "./admin-session-cache";

export const requireAdminSession = async () => {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  const user = await getAdminUserState(session.user.id);

  if (!user || user.role !== "ADMIN" || user.suspendedAt || user.deletedAt) {
    redirect("/login");
  }

  return session;
};
