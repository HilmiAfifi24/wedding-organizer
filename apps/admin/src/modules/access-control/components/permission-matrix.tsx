"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@wo/ui-components";

import type { SetAccessPermissionInput } from "@wo/shared-types";

import type { AccessMenuTreeNode, PermissionMatrixState } from "../types";

type PermissionMatrixProps = {
  menus: AccessMenuTreeNode[];
  matrix: PermissionMatrixState;
  onChange: (
    accessMenuId: string,
    field: Exclude<keyof SetAccessPermissionInput, "accessMenuId">,
    value: boolean | string[]
  ) => void;
};

const flattenWithDepth = (
  nodes: AccessMenuTreeNode[],
  depth = 0
): Array<{ menu: AccessMenuTreeNode; depth: number }> => {
  const rows: Array<{ menu: AccessMenuTreeNode; depth: number }> = [];

  for (const node of nodes) {
    rows.push({ menu: node, depth });
    rows.push(...flattenWithDepth(node.children, depth + 1));
  }

  return rows;
};

const CheckboxCell = ({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}) => (
  <label className="flex justify-center">
    <input
      type="checkbox"
      className="h-4 w-4 rounded border-border"
      checked={checked}
      onChange={(event) => onCheckedChange(event.target.checked)}
    />
  </label>
);

export const PermissionMatrix = ({ menus, matrix, onChange }: PermissionMatrixProps) => {
  const rows = flattenWithDepth(menus);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Menu</TableHead>
              <TableHead className="text-center">View</TableHead>
              <TableHead className="text-center">Insert</TableHead>
              <TableHead className="text-center">Update</TableHead>
              <TableHead className="text-center">Upsert</TableHead>
              <TableHead className="text-center">Delete</TableHead>
              <TableHead className="text-center">History</TableHead>
              <TableHead>Custom Event</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Belum ada menu.
                </TableCell>
              </TableRow>
            ) : (
              rows.map(({ menu, depth }) => {
                const permission = matrix[menu.id] ?? {
                  accessMenuId: menu.id,
                  canView: false,
                  canInsert: false,
                  canUpdate: false,
                  canUpsert: false,
                  canDelete: false,
                  canHistory: false,
                  customEvents: [],
                };

                return (
                  <TableRow key={menu.id}>
                    <TableCell>
                      <div style={{ paddingLeft: `${depth * 16}px` }}>
                        <p className="font-medium">{menu.name}</p>
                        <p className="text-xs text-muted-foreground">{menu.code}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <CheckboxCell
                        checked={permission.canView ?? false}
                        onCheckedChange={(next) => onChange(menu.id, "canView", next)}
                      />
                    </TableCell>
                    <TableCell>
                      <CheckboxCell
                        checked={permission.canInsert ?? false}
                        onCheckedChange={(next) => onChange(menu.id, "canInsert", next)}
                      />
                    </TableCell>
                    <TableCell>
                      <CheckboxCell
                        checked={permission.canUpdate ?? false}
                        onCheckedChange={(next) => onChange(menu.id, "canUpdate", next)}
                      />
                    </TableCell>
                    <TableCell>
                      <CheckboxCell
                        checked={permission.canUpsert ?? false}
                        onCheckedChange={(next) => onChange(menu.id, "canUpsert", next)}
                      />
                    </TableCell>
                    <TableCell>
                      <CheckboxCell
                        checked={permission.canDelete ?? false}
                        onCheckedChange={(next) => onChange(menu.id, "canDelete", next)}
                      />
                    </TableCell>
                    <TableCell>
                      <CheckboxCell
                        checked={permission.canHistory ?? false}
                        onCheckedChange={(next) => onChange(menu.id, "canHistory", next)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={(permission.customEvents ?? []).join(",")}
                        onChange={(event) =>
                          onChange(
                            menu.id,
                            "customEvents",
                            event.target.value
                              .split(",")
                              .map((item) => item.trim())
                              .filter(Boolean)
                          )
                        }
                        placeholder="event1,event2"
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
