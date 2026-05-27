"use client";

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";

import type { AccessMenuTreeNode } from "../types";

type MenuTreeListProps = {
  menus: AccessMenuTreeNode[];
  onEdit: (menu: AccessMenuTreeNode) => void;
  onDelete: (menu: AccessMenuTreeNode) => void;
};

const PermissionBadges = ({ menu }: { menu: AccessMenuTreeNode }) => {
  if (!menu.permissions) {
    return null;
  }

  const activeFlags = [
    { label: "View", enabled: menu.permissions.canView },
    { label: "Insert", enabled: menu.permissions.canInsert },
    { label: "Update", enabled: menu.permissions.canUpdate },
    { label: "Upsert", enabled: menu.permissions.canUpsert },
    { label: "Delete", enabled: menu.permissions.canDelete },
    { label: "History", enabled: menu.permissions.canHistory },
  ].filter((item) => item.enabled);

  if (activeFlags.length === 0) {
    return <Badge variant="outline">No Access</Badge>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {activeFlags.map((flag) => (
        <Badge key={flag.label} variant="outline" className="text-[10px] uppercase tracking-wide">
          {flag.label}
        </Badge>
      ))}
    </div>
  );
};

const MenuNodeRow = ({
  menu,
  depth,
  onEdit,
  onDelete,
}: {
  menu: AccessMenuTreeNode;
  depth: number;
  onEdit: (menu: AccessMenuTreeNode) => void;
  onDelete: (menu: AccessMenuTreeNode) => void;
}) => {
  return (
    <div className="space-y-2">
      <div
        className="grid gap-3 rounded-lg border border-border/70 bg-background px-4 py-3 md:grid-cols-[1fr_auto]"
        style={{ marginLeft: `${depth * 16}px` }}
      >
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{menu.name}</p>
            <Badge variant="outline">{menu.code}</Badge>
            {!menu.isActive && <Badge variant="warning">Inactive</Badge>}
          </div>
          <p className="text-xs text-muted-foreground">
            Path: {menu.path || "-"} | Urutan: {menu.sortOrder}
          </p>
          <PermissionBadges menu={menu} />
        </div>
        <div className="flex items-start gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(menu)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="text-danger" onClick={() => onDelete(menu)}>
            Hapus
          </Button>
        </div>
      </div>

      {menu.children.length > 0 && (
        <div className="space-y-2">
          {menu.children.map((child) => (
            <MenuNodeRow
              key={child.id}
              menu={child}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const MenuTreeList = ({ menus, onEdit, onDelete }: MenuTreeListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Struktur Menu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {menus.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada menu.</p>
        ) : (
          menus.map((menu) => (
            <MenuNodeRow key={menu.id} menu={menu} depth={0} onEdit={onEdit} onDelete={onDelete} />
          ))
        )}
      </CardContent>
    </Card>
  );
};
