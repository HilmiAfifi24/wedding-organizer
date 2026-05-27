import type { AccessMenuDTO, AccessPermissionDTO } from "@wo/shared-types";

import type { AccessMenuTreeNode } from "../../dto/access-control-dto";

type PermissionMap = Map<string, AccessPermissionDTO>;

const getPermissionProjection = (permission: AccessPermissionDTO | undefined) => {
  if (!permission) {
    return undefined;
  }

  return {
    canView: permission.canView,
    canInsert: permission.canInsert,
    canUpdate: permission.canUpdate,
    canUpsert: permission.canUpsert,
    canDelete: permission.canDelete,
    canHistory: permission.canHistory,
    customEvents: permission.customEvents,
  };
};

export const buildAccessMenuTree = (
  menus: AccessMenuDTO[],
  permissions?: AccessPermissionDTO[]
): AccessMenuTreeNode[] => {
  const permissionMap: PermissionMap = new Map(
    (permissions ?? []).map((permission) => [permission.accessMenuId, permission])
  );

  const nodeMap = new Map<string, AccessMenuTreeNode>();

  for (const menu of menus) {
    nodeMap.set(menu.id, {
      ...menu,
      permissions: getPermissionProjection(permissionMap.get(menu.id)),
      children: [],
    });
  }

  const roots: AccessMenuTreeNode[] = [];

  for (const menu of menus) {
    const node = nodeMap.get(menu.id);
    if (!node) {
      continue;
    }

    if (menu.parentId) {
      const parent = nodeMap.get(menu.parentId);
      if (parent) {
        parent.children.push(node);
        continue;
      }
    }

    roots.push(node);
  }

  const sortTree = (nodes: AccessMenuTreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.sortOrder === b.sortOrder) {
        return a.name.localeCompare(b.name);
      }

      return a.sortOrder - b.sortOrder;
    });

    for (const node of nodes) {
      sortTree(node.children);
    }
  };

  sortTree(roots);

  return roots;
};
