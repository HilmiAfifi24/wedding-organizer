import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/auth";

export const requireAdminSession = async () => {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  return session;
};
