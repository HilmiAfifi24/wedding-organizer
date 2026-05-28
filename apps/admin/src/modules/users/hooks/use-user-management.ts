"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { AdminUserDetailDTO, AdminUserListItemDTO } from "@wo/shared-types";

import { usersApi } from "../services/users-api";
import type { UserListFilters } from "../types";

const defaultFilters: UserListFilters = {
  role: "ALL",
  status: "ALL",
  sortBy: "createdAt",
  sortDirection: "desc",
  includeDeleted: false,
};

export const useUserManagement = () => {
  const [items, setItems] = useState<AdminUserListItemDTO[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<UserListFilters>(defaultFilters);

  const [isListLoading, setIsListLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminUserDetailDTO | null>(null);

  const requestIdRef = useRef(0);

  const nextRequestId = () => {
    requestIdRef.current += 1;
    return requestIdRef.current;
  };

  const isLatestRequest = (id: number) => requestIdRef.current === id;

  const clearError = () => setError(null);

  const loadUsers = useCallback(async () => {
    const requestId = nextRequestId();
    setIsListLoading(true);
    setError(null);

    try {
      const response = await usersApi.list({
        page,
        pageSize,
        filters,
      });

      if (!isLatestRequest(requestId)) return;

      setItems(response.items);
      setTotalItems(response.totalItems);
      setTotalPages(response.totalPages);
    } catch (loadError) {
      if (!isLatestRequest(requestId)) return;
      setError(loadError instanceof Error ? loadError.message : "Failed to load users");
    } finally {
      if (isLatestRequest(requestId)) {
        setIsListLoading(false);
      }
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadUsers();
  }, [loadUsers]);

  const refresh = useCallback(async () => {
    await loadUsers();
  }, [loadUsers]);

  const changePage = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  const changePageSize = useCallback((nextSize: number) => {
    setPageSize(nextSize);
    setPage(1);
  }, []);

  const updateFilters = useCallback((patch: Partial<UserListFilters>) => {
    setFilters((current) => ({
      ...current,
      ...patch,
    }));
    setPage(1);
  }, []);

  const updateSearch = useCallback((search: string) => {
    setFilters((current) => ({
      ...current,
      search,
    }));
    setPage(1);
  }, []);

  const openDetail = useCallback(async (userId: string, includeHistory = false) => {
    setIsDetailLoading(true);
    setError(null);

    try {
      const response = await usersApi.detail(userId, { includeHistory, includeDeleted: true });
      setDetail(response);
      return response;
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : "Failed to load user detail");
      return null;
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  const closeDetail = useCallback(() => {
    setDetail(null);
  }, []);

  const suspendUser = useCallback(
    async (userId: string) => {
      setIsActionLoading(true);
      setError(null);

      try {
        await usersApi.suspend(userId);
        await loadUsers();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "Failed to suspend user");
        throw actionError;
      } finally {
        setIsActionLoading(false);
      }
    },
    [loadUsers]
  );

  const unsuspendUser = useCallback(
    async (userId: string) => {
      setIsActionLoading(true);
      setError(null);

      try {
        await usersApi.unsuspend(userId);
        await loadUsers();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "Failed to unsuspend user");
        throw actionError;
      } finally {
        setIsActionLoading(false);
      }
    },
    [loadUsers]
  );

  const deleteUser = useCallback(
    async (userId: string) => {
      setIsActionLoading(true);
      setError(null);

      try {
        await usersApi.softDelete(userId);
        await loadUsers();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "Failed to delete user");
        throw actionError;
      } finally {
        setIsActionLoading(false);
      }
    },
    [loadUsers]
  );

  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages,
    filters,

    isListLoading,
    isDetailLoading,
    isActionLoading,
    error,
    detail,

    clearError,
    refresh,
    changePage,
    setPageSize: changePageSize,
    updateFilters,
    updateSearch,
    openDetail,
    closeDetail,
    suspendUser,
    unsuspendUser,
    deleteUser,

    isEmpty: useMemo(() => !isListLoading && items.length === 0, [isListLoading, items.length]),
  };
};
