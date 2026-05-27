import type {
  AccessMenuDTO,
  AccessProfileDTO,
  AccessUserDTO,
  CreateAccessMenuInput,
  CreateAccessProfileInput,
  SetAccessPermissionInput,
  UpdateAccessMenuInput,
  UpdateAccessProfileInput,
} from "@wo/shared-types";

import type {
  AccessMenuTreeNode,
  AccessProfilePermissionsResponse,
  AccessUserWithMenusResponse,
} from "../types";

type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiError = {
  success: false;
  message: string;
};

const buildQuery = (params: Record<string, string | undefined>) => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const body = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiError | null;

  if (!response.ok || !body || body.success === false) {
    throw new Error(body && "message" in body ? body.message : "Request failed");
  }

  return body.data;
};

const request = async <T>(input: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  return parseResponse<T>(response);
};

export const accessControlApi = {
  listMenus: (accessProfileId?: string) =>
    request<AccessMenuTreeNode[]>(
      `/api/admin/access-control/menus${buildQuery({ accessProfileId })}`
    ),

  createMenu: (payload: CreateAccessMenuInput) =>
    request<AccessMenuDTO>("/api/admin/access-control/menus", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateMenu: (id: string, payload: UpdateAccessMenuInput) =>
    request<AccessMenuDTO>(`/api/admin/access-control/menus/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteMenu: (id: string) =>
    request<void>(`/api/admin/access-control/menus/${id}`, {
      method: "DELETE",
    }),

  listProfiles: () => request<AccessProfileDTO[]>("/api/admin/access-control/profiles"),

  createProfile: (payload: CreateAccessProfileInput) =>
    request<AccessProfileDTO>("/api/admin/access-control/profiles", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateProfile: (id: string, payload: UpdateAccessProfileInput) =>
    request<AccessProfileDTO>(`/api/admin/access-control/profiles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteProfile: (id: string) =>
    request<void>(`/api/admin/access-control/profiles/${id}`, {
      method: "DELETE",
    }),

  getProfilePermissions: (id: string) =>
    request<AccessProfilePermissionsResponse>(
      `/api/admin/access-control/profiles/${id}/permissions`
    ),

  setProfilePermissions: (id: string, permissions: SetAccessPermissionInput[]) =>
    request<AccessProfilePermissionsResponse>(
      `/api/admin/access-control/profiles/${id}/permissions`,
      {
        method: "PUT",
        body: JSON.stringify({ permissions }),
      }
    ),

  listUsers: (search?: string) =>
    request<AccessUserDTO[]>(
      `/api/admin/access-control/users${buildQuery({ search: search?.trim() })}`
    ),

  assignUserProfile: (userId: string, accessProfileId: string | null) =>
    request<AccessUserDTO>(`/api/admin/access-control/users/${userId}/profile`, {
      method: "PATCH",
      body: JSON.stringify({ accessProfileId }),
    }),

  getUserMenus: (userId: string) =>
    request<AccessUserWithMenusResponse>(`/api/admin/access-control/users/${userId}/menus`),
};
