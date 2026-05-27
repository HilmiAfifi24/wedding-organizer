"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  CreateAccessMenuInput,
  CreateAccessProfileInput,
  SetAccessPermissionInput,
  UpdateAccessMenuInput,
  UpdateAccessProfileInput,
} from "@wo/shared-types";

import { accessControlApi } from "../services/access-control-api";
import type {
  AccessMenuTreeNode,
  PermissionMatrixState,
} from "../types";

const flattenMenuTree = (nodes: AccessMenuTreeNode[]): AccessMenuTreeNode[] => {
  const result: AccessMenuTreeNode[] = [];

  const walk = (items: AccessMenuTreeNode[]) => {
    for (const item of items) {
      result.push(item);
      walk(item.children);
    }
  };

  walk(nodes);
  return result;
};

const createDefaultPermission = (accessMenuId: string): SetAccessPermissionInput => ({
  accessMenuId,
  canView: false,
  canInsert: false,
  canUpdate: false,
  canUpsert: false,
  canDelete: false,
  canHistory: false,
  customEvents: [],
});

const buildPermissionMatrix = (
  menus: AccessMenuTreeNode[],
  profilePermissions?: SetAccessPermissionInput[]
): PermissionMatrixState => {
  const matrix: PermissionMatrixState = {};

  for (const menu of flattenMenuTree(menus)) {
    matrix[menu.id] = createDefaultPermission(menu.id);
  }

  for (const permission of profilePermissions ?? []) {
    matrix[permission.accessMenuId] = {
      ...createDefaultPermission(permission.accessMenuId),
      ...permission,
      accessMenuId: permission.accessMenuId,
      customEvents: permission.customEvents ?? [],
    };
  }

  return matrix;
};

export const useAccessControlDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [menus, setMenus] = useState<AccessMenuTreeNode[]>([]);
  const [profiles, setProfiles] = useState<Awaited<ReturnType<typeof accessControlApi.listProfiles>>>([]);
  const [users, setUsers] = useState<Awaited<ReturnType<typeof accessControlApi.listUsers>>>([]);

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrixState>({});

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const loadMenus = useCallback(async (profileId?: string) => {
    const menuTree = await accessControlApi.listMenus(profileId);
    setMenus(menuTree);
    return menuTree;
  }, []);

  const loadPermissions = useCallback(
    async (profileId: string, menuTree?: AccessMenuTreeNode[]) => {
      const response = await accessControlApi.getProfilePermissions(profileId);
      const mappedPermissions: SetAccessPermissionInput[] = response.permissions.map(
        (permission) => ({
          accessMenuId: permission.accessMenuId,
          canView: permission.canView,
          canInsert: permission.canInsert,
          canUpdate: permission.canUpdate,
          canUpsert: permission.canUpsert,
          canDelete: permission.canDelete,
          canHistory: permission.canHistory,
          customEvents: permission.customEvents,
        })
      );

      const sourceMenus = menuTree ?? menus;
      setPermissionMatrix(buildPermissionMatrix(sourceMenus, mappedPermissions));
    },
    [menus]
  );

  const loadUsers = useCallback(async (search?: string) => {
    const data = await accessControlApi.listUsers(search);
    setUsers(data);
  }, []);

  const loadInitial = useCallback(async () => {
    clearMessages();
    setIsLoading(true);

    try {
      const [profileData, userData, menuTree] = await Promise.all([
        accessControlApi.listProfiles(),
        accessControlApi.listUsers(),
        loadMenus(),
      ]);

      setProfiles(profileData);
      setUsers(userData);

      const firstProfileId = profileData[0]?.id ?? null;
      setSelectedProfileId(firstProfileId);

      if (firstProfileId) {
        await loadPermissions(firstProfileId, menuTree);
      } else {
        setPermissionMatrix(buildPermissionMatrix(menuTree));
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [loadMenus, loadPermissions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadInitial();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [loadInitial]);

  const selectProfile = useCallback(
    async (profileId: string) => {
      clearMessages();
      setSelectedProfileId(profileId);
      setIsLoading(true);

      try {
        const menuTree = await loadMenus(profileId);
        await loadPermissions(profileId, menuTree);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load permissions");
      } finally {
        setIsLoading(false);
      }
    },
    [loadMenus, loadPermissions]
  );

  const createMenu = useCallback(
    async (payload: CreateAccessMenuInput) => {
      clearMessages();
      setIsSaving(true);

      try {
        await accessControlApi.createMenu(payload);
        const menuTree = await loadMenus(selectedProfileId ?? undefined);

        if (selectedProfileId) {
          await loadPermissions(selectedProfileId, menuTree);
        } else {
          setPermissionMatrix(buildPermissionMatrix(menuTree));
        }

        setSuccess("Menu berhasil ditambahkan");
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "Failed to create menu");
      } finally {
        setIsSaving(false);
      }
    },
    [loadMenus, loadPermissions, selectedProfileId]
  );

  const updateMenu = useCallback(
    async (id: string, payload: UpdateAccessMenuInput) => {
      clearMessages();
      setIsSaving(true);

      try {
        await accessControlApi.updateMenu(id, payload);
        const menuTree = await loadMenus(selectedProfileId ?? undefined);

        if (selectedProfileId) {
          await loadPermissions(selectedProfileId, menuTree);
        }

        setSuccess("Menu berhasil diperbarui");
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "Failed to update menu");
      } finally {
        setIsSaving(false);
      }
    },
    [loadMenus, loadPermissions, selectedProfileId]
  );

  const deleteMenu = useCallback(
    async (id: string) => {
      clearMessages();
      setIsSaving(true);

      try {
        await accessControlApi.deleteMenu(id);
        const menuTree = await loadMenus(selectedProfileId ?? undefined);

        if (selectedProfileId) {
          await loadPermissions(selectedProfileId, menuTree);
        } else {
          setPermissionMatrix(buildPermissionMatrix(menuTree));
        }

        setSuccess("Menu berhasil dihapus");
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "Failed to delete menu");
      } finally {
        setIsSaving(false);
      }
    },
    [loadMenus, loadPermissions, selectedProfileId]
  );

  const createProfile = useCallback(
    async (payload: CreateAccessProfileInput) => {
      clearMessages();
      setIsSaving(true);

      try {
        const created = await accessControlApi.createProfile(payload);
        const profileData = await accessControlApi.listProfiles();
        const menuTree = await loadMenus(created.id);

        setProfiles(profileData);
        setSelectedProfileId(created.id);
        setPermissionMatrix(buildPermissionMatrix(menuTree));

        setSuccess("Profil akses berhasil ditambahkan");
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "Failed to create profile");
      } finally {
        setIsSaving(false);
      }
    },
    [loadMenus]
  );

  const updateProfile = useCallback(
    async (profileId: string, payload: UpdateAccessProfileInput) => {
      clearMessages();
      setIsSaving(true);

      try {
        await accessControlApi.updateProfile(profileId, payload);
        const profileData = await accessControlApi.listProfiles();
        setProfiles(profileData);
        setSuccess("Profil akses berhasil diperbarui");
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "Failed to update profile");
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const deleteProfile = useCallback(
    async (profileId: string) => {
      clearMessages();
      setIsSaving(true);

      try {
        await accessControlApi.deleteProfile(profileId);

        const profileData = await accessControlApi.listProfiles();
        const nextProfileId = profileData[0]?.id ?? null;
        const menuTree = await loadMenus(nextProfileId ?? undefined);

        setProfiles(profileData);
        setSelectedProfileId(nextProfileId);

        if (nextProfileId) {
          await loadPermissions(nextProfileId, menuTree);
        } else {
          setPermissionMatrix(buildPermissionMatrix(menuTree));
        }

        setSuccess("Profil akses berhasil dihapus");
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "Failed to delete profile");
      } finally {
        setIsSaving(false);
      }
    },
    [loadMenus, loadPermissions]
  );

  const updatePermission = useCallback(
    (accessMenuId: string, field: Exclude<keyof SetAccessPermissionInput, "accessMenuId">, value: boolean | string[]) => {
      setPermissionMatrix((current) => ({
        ...current,
        [accessMenuId]: {
          ...(current[accessMenuId] ?? createDefaultPermission(accessMenuId)),
          [field]: value,
        },
      }));
    },
    []
  );

  const savePermissions = useCallback(async () => {
    if (!selectedProfileId) {
      setError("Pilih profil akses terlebih dahulu");
      return;
    }

    clearMessages();
    setIsSaving(true);

    try {
      const permissions = Object.values(permissionMatrix);
      await accessControlApi.setProfilePermissions(selectedProfileId, permissions);
      setSuccess("Hak akses berhasil disimpan");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save permissions");
    } finally {
      setIsSaving(false);
    }
  }, [permissionMatrix, selectedProfileId]);

  const assignUserProfile = useCallback(
    async (userId: string, accessProfileId: string | null) => {
      clearMessages();
      setIsSaving(true);

      try {
        const updated = await accessControlApi.assignUserProfile(userId, accessProfileId);

        setUsers((current) =>
          current.map((user) => (user.id === userId ? updated : user))
        );

        setSuccess("Profil user berhasil diperbarui");
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "Failed to assign user profile");
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const openUserMenus = useCallback((userId: string) => accessControlApi.getUserMenus(userId), []);

  const flatMenus = useMemo(() => flattenMenuTree(menus), [menus]);

  return {
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
  };
};
