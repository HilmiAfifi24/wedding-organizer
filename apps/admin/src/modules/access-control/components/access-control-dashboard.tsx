"use client";

import { useMemo, useState } from "react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@wo/ui-components";

import type {
  CreateAccessMenuInput,
  CreateAccessProfileInput,
  SetAccessPermissionInput,
  UpdateAccessMenuInput,
} from "@wo/shared-types";

import { useAccessControlDashboard } from "../hooks/use-access-control-dashboard";
import type { AccessMenuTreeNode } from "../types";
import { MenuTreeList } from "./menu-tree-list";
import { PermissionMatrix } from "./permission-matrix";

const emptyMenuForm: CreateAccessMenuInput = {
  code: "",
  name: "",
  path: "",
  icon: "",
  parentId: "",
  sortOrder: 0,
  isActive: true,
};

const renderEffectiveMenus = (menus: AccessMenuTreeNode[], depth = 0): React.ReactNode => {
  return menus.map((menu) => (
    <div key={menu.id} className="space-y-2" style={{ marginLeft: `${depth * 16}px` }}>
      <div className="rounded-md border border-border/60 px-3 py-2">
        <p className="text-sm font-medium">{menu.name}</p>
        <p className="text-xs text-muted-foreground">{menu.path || "-"}</p>
      </div>
      {menu.children.length > 0 && renderEffectiveMenus(menu.children, depth + 1)}
    </div>
  ));
};

export const AccessControlDashboard = () => {
  const {
    isLoading,
    isSaving,
    error,
    success,
    clearMessages,
    menus,
    flatMenus,
    profiles,
    users,
    selectedProfileId,
    permissionMatrix,
    selectProfile,
    loadUsers,
    createMenu,
    updateMenu,
    deleteMenu,
    createProfile,
    updateProfile,
    deleteProfile,
    updatePermission,
    savePermissions,
    assignUserProfile,
    openUserMenus,
  } = useAccessControlDashboard();

  const [menuForm, setMenuForm] = useState<CreateAccessMenuInput>(emptyMenuForm);
  const [profileForm, setProfileForm] = useState<CreateAccessProfileInput>({
    code: "",
    name: "",
    description: "",
    isSystem: false,
  });
  const [editingMenu, setEditingMenu] = useState<AccessMenuTreeNode | null>(null);
  const [editMenuForm, setEditMenuForm] = useState<UpdateAccessMenuInput>({});
  const [search, setSearch] = useState("");
  const [profileDraftById, setProfileDraftById] = useState<
    Record<string, { code: string; name: string; description: string }>
  >({});
  const [userProfileDraft, setUserProfileDraft] = useState<Record<string, string>>({});
  const [userMenusDialog, setUserMenusDialog] = useState<{
    open: boolean;
    userName: string;
    menus: AccessMenuTreeNode[];
  }>({
    open: false,
    userName: "",
    menus: [],
  });

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileId) ?? null,
    [profiles, selectedProfileId]
  );

  const selectedProfileDraft = selectedProfile
    ? profileDraftById[selectedProfile.id] ?? {
        code: selectedProfile.code,
        name: selectedProfile.name,
        description: selectedProfile.description ?? "",
      }
    : { code: "", name: "", description: "" };

  const parentOptions = useMemo(
    () => flatMenus.map((menu) => ({ id: menu.id, label: `${menu.code} - ${menu.name}` })),
    [flatMenus]
  );

  const handleCreateMenu = async () => {
    if (!menuForm.code?.trim() || !menuForm.name?.trim()) {
      return;
    }

    await createMenu({
      ...menuForm,
      code: menuForm.code.trim(),
      name: menuForm.name.trim(),
      path: menuForm.path?.trim() || undefined,
      icon: menuForm.icon?.trim() || undefined,
      parentId: menuForm.parentId?.trim() || undefined,
      sortOrder: Number(menuForm.sortOrder ?? 0),
    });

    setMenuForm(emptyMenuForm);
  };

  const handleUpdateMenu = async () => {
    if (!editingMenu) {
      return;
    }

    await updateMenu(editingMenu.id, {
      ...editMenuForm,
      parentId: editMenuForm.parentId === "" ? null : editMenuForm.parentId,
      path: editMenuForm.path === "" ? null : editMenuForm.path,
      icon: editMenuForm.icon === "" ? null : editMenuForm.icon,
    });

    setEditingMenu(null);
    setEditMenuForm({});
  };

  const handleDeleteMenu = async (menu: AccessMenuTreeNode) => {
    if (!window.confirm(`Hapus menu ${menu.name}?`)) {
      return;
    }

    await deleteMenu(menu.id);
  };

  const handleCreateProfile = async () => {
    if (!profileForm.code.trim() || !profileForm.name.trim()) {
      return;
    }

    await createProfile({
      ...profileForm,
      code: profileForm.code.trim(),
      name: profileForm.name.trim(),
      description: profileForm.description?.trim() || undefined,
    });

    setProfileForm({
      code: "",
      name: "",
      description: "",
      isSystem: false,
    });
  };

  const handleOpenMenuDialog = async (userId: string, userName: string) => {
    clearMessages();

    try {
      const response = await openUserMenus(userId);
      setUserMenusDialog({
        open: true,
        userName,
        menus: response.menuTree,
      });
    } catch {
      // error handled by hook in other flows
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Administrasi Akses</h1>
          <p className="text-sm text-muted-foreground">
            Manajemen menu, role/profil, dan akses user sepenuhnya dari backend.
          </p>
        </header>

        {error && (
          <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            {success}
          </div>
        )}

        {isLoading && (
          <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Memuat data akses...
          </div>
        )}

        <Tabs defaultValue="menus" className="space-y-4">
          <TabsList>
            <TabsTrigger value="menus">Menu</TabsTrigger>
            <TabsTrigger value="profiles">Role & Permission</TabsTrigger>
            <TabsTrigger value="users">User Access</TabsTrigger>
          </TabsList>

          <TabsContent value="menus" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tambah Menu</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Input
                  placeholder="Code"
                  value={menuForm.code}
                  onChange={(event) => setMenuForm((current) => ({ ...current, code: event.target.value }))}
                />
                <Input
                  placeholder="Name"
                  value={menuForm.name}
                  onChange={(event) => setMenuForm((current) => ({ ...current, name: event.target.value }))}
                />
                <Input
                  placeholder="Path"
                  value={menuForm.path ?? ""}
                  onChange={(event) => setMenuForm((current) => ({ ...current, path: event.target.value }))}
                />
                <Input
                  placeholder="Icon"
                  value={menuForm.icon ?? ""}
                  onChange={(event) => setMenuForm((current) => ({ ...current, icon: event.target.value }))}
                />
                <Input
                  placeholder="Sort Order"
                  type="number"
                  value={String(menuForm.sortOrder ?? 0)}
                  onChange={(event) =>
                    setMenuForm((current) => ({ ...current, sortOrder: Number(event.target.value || 0) }))
                  }
                />
                <Select
                  value={menuForm.parentId || "none"}
                  onValueChange={(value) =>
                    setMenuForm((current) => ({
                      ...current,
                      parentId: value === "none" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Parent Menu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Parent</SelectItem>
                    {parentOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <label className="flex items-center gap-2 rounded-md border border-border px-3 text-sm">
                  <input
                    type="checkbox"
                    checked={menuForm.isActive ?? true}
                    onChange={(event) =>
                      setMenuForm((current) => ({ ...current, isActive: event.target.checked }))
                    }
                  />
                  Aktif
                </label>
                <Button onClick={() => void handleCreateMenu()} disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : "Tambah Menu"}
                </Button>
              </CardContent>
            </Card>

            <MenuTreeList
              menus={menus}
              onEdit={(menu) => {
                setEditingMenu(menu);
                setEditMenuForm({
                  code: menu.code,
                  name: menu.name,
                  path: menu.path,
                  icon: menu.icon,
                  parentId: menu.parentId,
                  sortOrder: menu.sortOrder,
                  isActive: menu.isActive,
                });
              }}
              onDelete={(menu) => void handleDeleteMenu(menu)}
            />
          </TabsContent>

          <TabsContent value="profiles" className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Profil Akses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {profiles.map((profile) => (
                      <button
                        key={profile.id}
                        className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                          profile.id === selectedProfileId
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-muted/40"
                        }`}
                        onClick={() => void selectProfile(profile.id)}
                      >
                        <p className="font-medium">{profile.name}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline">{profile.code}</Badge>
                          {profile.isSystem && <Badge variant="warning">System</Badge>}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2 border-t border-border pt-3">
                    <Input
                      placeholder="Code"
                      value={profileForm.code}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, code: event.target.value }))
                      }
                    />
                    <Input
                      placeholder="Name"
                      value={profileForm.name}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, name: event.target.value }))
                      }
                    />
                    <Input
                      placeholder="Description"
                      value={profileForm.description ?? ""}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, description: event.target.value }))
                      }
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={profileForm.isSystem ?? false}
                        onChange={(event) =>
                          setProfileForm((current) => ({ ...current, isSystem: event.target.checked }))
                        }
                      />
                      System Profile
                    </label>
                    <Button onClick={() => void handleCreateProfile()} disabled={isSaving} className="w-full">
                      Tambah Profil
                    </Button>
                  </div>

                  {selectedProfile && (
                    <div className="space-y-2 border-t border-border pt-3">
                      <Input
                        value={selectedProfileDraft.code}
                        onChange={(event) =>
                          setProfileDraftById((current) => ({
                            ...current,
                            [selectedProfile.id]: {
                              ...selectedProfileDraft,
                              code: event.target.value,
                            },
                          }))
                        }
                        placeholder="Code"
                      />
                      <Input
                        value={selectedProfileDraft.name}
                        onChange={(event) =>
                          setProfileDraftById((current) => ({
                            ...current,
                            [selectedProfile.id]: {
                              ...selectedProfileDraft,
                              name: event.target.value,
                            },
                          }))
                        }
                        placeholder="Name"
                      />
                      <Input
                        value={selectedProfileDraft.description}
                        onChange={(event) =>
                          setProfileDraftById((current) => ({
                            ...current,
                            [selectedProfile.id]: {
                              ...selectedProfileDraft,
                              description: event.target.value,
                            },
                          }))
                        }
                        placeholder="Description"
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          void updateProfile(selectedProfile.id, {
                            code: selectedProfileDraft.code.trim(),
                            name: selectedProfileDraft.name.trim(),
                            description: selectedProfileDraft.description.trim() || null,
                          })
                        }
                      >
                        Simpan Perubahan Profil
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full text-danger"
                        onClick={() => {
                          if (window.confirm(`Hapus profil ${selectedProfile.name}?`)) {
                            void deleteProfile(selectedProfile.id);
                          }
                        }}
                        disabled={selectedProfile.isSystem}
                      >
                        Hapus Profil Terpilih
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-3">
                <PermissionMatrix
                  menus={menus}
                  matrix={permissionMatrix}
                  onChange={(accessMenuId, field, value) =>
                    updatePermission(
                      accessMenuId,
                      field as Exclude<keyof SetAccessPermissionInput, "accessMenuId">,
                      value
                    )
                  }
                />
                <div className="flex justify-end">
                  <Button onClick={() => void savePermissions()} disabled={!selectedProfileId || isSaving}>
                    Simpan Permission
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manajemen Akses User</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2 md:flex-row">
                  <Input
                    placeholder="Cari user berdasarkan nama/email"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => void loadUsers(search)}
                    disabled={isSaving || isLoading}
                  >
                    Cari
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Profil Akses</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Tidak ada user.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => {
                        const draftValue = userProfileDraft[user.id] ?? user.accessProfileId ?? "none";

                        return (
                          <TableRow key={user.id}>
                            <TableCell>
                              <p className="font-medium">{user.name || "-"}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{user.role}</Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={draftValue}
                                onValueChange={(value) =>
                                  setUserProfileDraft((current) => ({
                                    ...current,
                                    [user.id]: value,
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih profil" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Tanpa profil</SelectItem>
                                  {profiles.map((profile) => (
                                    <SelectItem key={profile.id} value={profile.id}>
                                      {profile.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    void assignUserProfile(
                                      user.id,
                                      draftValue === "none" ? null : draftValue
                                    )
                                  }
                                >
                                  Simpan
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => void handleOpenMenuDialog(user.id, user.name || user.email)}
                                >
                                  Lihat Menu
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!editingMenu} onOpenChange={(open) => !open && setEditingMenu(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu</DialogTitle>
            <DialogDescription>Ubah atribut menu dan simpan perubahan.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Code"
              value={editMenuForm.code ?? ""}
              onChange={(event) => setEditMenuForm((current) => ({ ...current, code: event.target.value }))}
            />
            <Input
              placeholder="Name"
              value={editMenuForm.name ?? ""}
              onChange={(event) => setEditMenuForm((current) => ({ ...current, name: event.target.value }))}
            />
            <Input
              placeholder="Path"
              value={editMenuForm.path ?? ""}
              onChange={(event) => setEditMenuForm((current) => ({ ...current, path: event.target.value }))}
            />
            <Input
              placeholder="Icon"
              value={editMenuForm.icon ?? ""}
              onChange={(event) => setEditMenuForm((current) => ({ ...current, icon: event.target.value }))}
            />
            <Input
              placeholder="Sort Order"
              type="number"
              value={String(editMenuForm.sortOrder ?? 0)}
              onChange={(event) =>
                setEditMenuForm((current) => ({ ...current, sortOrder: Number(event.target.value || 0) }))
              }
            />
            <Select
              value={editMenuForm.parentId ?? "none"}
              onValueChange={(value) =>
                setEditMenuForm((current) => ({
                  ...current,
                  parentId: value === "none" ? "" : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Parent Menu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Parent</SelectItem>
                {parentOptions
                  .filter((option) => option.id !== editingMenu?.id)
                  .map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editMenuForm.isActive ?? true}
                onChange={(event) =>
                  setEditMenuForm((current) => ({ ...current, isActive: event.target.checked }))
                }
              />
              Aktif
            </label>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingMenu(null)}>
              Batal
            </Button>
            <Button onClick={() => void handleUpdateMenu()} disabled={isSaving}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={userMenusDialog.open}
        onOpenChange={(open) => setUserMenusDialog((current) => ({ ...current, open }))}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Menu Efektif User</DialogTitle>
            <DialogDescription>{userMenusDialog.userName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">{renderEffectiveMenus(userMenusDialog.menus)}</div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUserMenusDialog((current) => ({ ...current, open: false }))}
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};
