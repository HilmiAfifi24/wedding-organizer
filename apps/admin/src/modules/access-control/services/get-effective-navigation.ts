import "server-only";

import { createAccessControlUseCases } from "@/core/infrastructure/http/access-control-factory";
import { buildSidebarNavigation } from "@/shared/lib/sidebar-navigation";

export const getEffectiveNavigationForUser = async (userId: string) => {
  const { getUserAccessMenuTreeUseCase } = createAccessControlUseCases();
  const result = await getUserAccessMenuTreeUseCase.execute(userId);

  return buildSidebarNavigation(result.menuTree);
};
