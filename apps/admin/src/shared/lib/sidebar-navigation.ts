import type { AccessMenuTreeNode } from "@/modules/access-control/types";

export interface SidebarNavigationItem {
  id: string;
  title: string;
  path: string | null;
  children: SidebarNavigationItem[];
}

const canViewMenu = (menu: AccessMenuTreeNode) => {
  if (!menu.isActive) {
    return false;
  }

  return menu.permissions?.canView ?? false;
};

export const buildSidebarNavigation = (
  menuTree: AccessMenuTreeNode[]
): SidebarNavigationItem[] => {
  const toNavItem = (menu: AccessMenuTreeNode): SidebarNavigationItem | null => {
    const visibleChildren = menu.children
      .map(toNavItem)
      .filter((item): item is SidebarNavigationItem => item !== null);

    const visibleSelf = canViewMenu(menu);

    if (!visibleSelf && visibleChildren.length === 0) {
      return null;
    }

    return {
      id: menu.id,
      title: menu.name,
      path: visibleSelf ? menu.path ?? null : null,
      children: visibleChildren,
    };
  };

  return menuTree
    .map(toNavItem)
    .filter((item): item is SidebarNavigationItem => item !== null);
};
