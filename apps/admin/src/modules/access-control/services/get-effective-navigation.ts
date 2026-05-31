import "server-only";

import { unstable_cache } from "next/cache";

import { createAccessControlUseCases } from "@/core/infrastructure/http/access-control-factory";
import { buildSidebarNavigation } from "@/shared/lib/sidebar-navigation";
import { ADMIN_NAVIGATION_CACHE_TAG } from "./navigation-cache";

const getCachedEffectiveNavigation = unstable_cache(
  async (userId: string) => {
    const { getUserAccessMenuTreeUseCase } = createAccessControlUseCases();
    const result = await getUserAccessMenuTreeUseCase.execute(userId);

    return buildSidebarNavigation(result.menuTree);
  },
  ["admin-effective-navigation"],
  {
    tags: [ADMIN_NAVIGATION_CACHE_TAG],
    revalidate: 300,
  }
);

export const getEffectiveNavigationForUser = async (userId: string) => {
  return getCachedEffectiveNavigation(userId);
};
