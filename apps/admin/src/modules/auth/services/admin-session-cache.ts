import "server-only";

import { revalidateTag, unstable_cache } from "next/cache";

import { prisma } from "@/core/infrastructure/db/prisma";

export const ADMIN_SESSION_CACHE_TAG = "admin-session-user-state";

const getCachedAdminUserState = unstable_cache(
  async (userId: string) => {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        suspendedAt: true,
        deletedAt: true,
      },
    });
  },
  ["admin-session-user-state"],
  {
    tags: [ADMIN_SESSION_CACHE_TAG],
    revalidate: 15,
  }
);

export const getAdminUserState = async (userId: string) => {
  return getCachedAdminUserState(userId);
};

export const revalidateAdminSessionCache = () => {
  revalidateTag(ADMIN_SESSION_CACHE_TAG, "max");
};
