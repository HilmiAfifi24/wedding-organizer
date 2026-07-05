"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { AdminAdatListItemDTO } from "@wo/shared-types";

import { adatsApi } from "../services/adats-api";
import type { AdatListFilters, AdatListResult } from "../types";

const defaultFilters: AdatListFilters = {
  sortBy: "name",
  sortDirection: "asc",
};

const normalizeAdatItem = (item: AdminAdatListItemDTO): AdminAdatListItemDTO => ({
  ...item,
  createdAt: new Date(item.createdAt),
  updatedAt: new Date(item.updatedAt),
});

export type AdatManagementInitialState = {
  list: AdatListResult;
  queryState: {
    page: number;
    pageSize: number;
    filters: AdatListFilters;
  };
};

export const useAdatManagement = (initialState?: AdatManagementInitialState) => {
  const [items, setItems] = useState<AdminAdatListItemDTO[]>(
    initialState?.list.items.map(normalizeAdatItem) ?? []
  );
  const [page, setPage] = useState(initialState?.queryState.page ?? 1);
  const [pageSize, setPageSize] = useState(initialState?.queryState.pageSize ?? 10);
  const [totalItems, setTotalItems] = useState(initialState?.list.totalItems ?? 0);
  const [totalPages, setTotalPages] = useState(initialState?.list.totalPages ?? 1);
  const [filters, setFilters] = useState<AdatListFilters>(
    initialState?.queryState.filters ?? defaultFilters
  );
  const [isListLoading, setIsListLoading] = useState(!initialState);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const skipInitialLoadRef = useRef(Boolean(initialState));

  const nextRequestId = () => {
    requestIdRef.current += 1;
    return requestIdRef.current;
  };

  const isLatestRequest = (id: number) => requestIdRef.current === id;

  const loadAdats = useCallback(async () => {
    const requestId = nextRequestId();
    setIsListLoading(true);
    setError(null);

    try {
      const response = await adatsApi.list({
        page,
        pageSize,
        filters,
      });

      if (!isLatestRequest(requestId)) {
        return;
      }

      setItems(response.items.map(normalizeAdatItem));
      setTotalItems(response.totalItems);
      setTotalPages(response.totalPages);
    } catch (loadError) {
      if (!isLatestRequest(requestId)) {
        return;
      }

      setError(loadError instanceof Error ? loadError.message : "Failed to load adats");
    } finally {
      if (isLatestRequest(requestId)) {
        setIsListLoading(false);
      }
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    if (skipInitialLoadRef.current) {
      skipInitialLoadRef.current = false;
      return;
    }

    void loadAdats();
  }, [loadAdats]);

  const refresh = useCallback(async () => {
    await loadAdats();
  }, [loadAdats]);

  const changePage = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  const changePageSize = useCallback((nextSize: number) => {
    setPageSize(nextSize);
    setPage(1);
  }, []);

  const updateFilters = useCallback((patch: Partial<AdatListFilters>) => {
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

  const runAction = useCallback(
    async (action: () => Promise<unknown>, fallbackMessage: string) => {
      setIsActionLoading(true);
      setError(null);

      try {
        await action();
        await loadAdats();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : fallbackMessage);
        throw actionError;
      } finally {
        setIsActionLoading(false);
      }
    },
    [loadAdats]
  );

  const createAdat = useCallback(
    async (name: string) => {
      await runAction(
        () => adatsApi.create({ name }),
        "Failed to create adat"
      );
    },
    [runAction]
  );

  const updateAdat = useCallback(
    async (adatId: string, name: string) => {
      await runAction(
        () => adatsApi.update(adatId, { name }),
        "Failed to update adat"
      );
    },
    [runAction]
  );

  const deleteAdat = useCallback(
    async (adatId: string) => {
      await runAction(() => adatsApi.remove(adatId), "Failed to delete adat");
    },
    [runAction]
  );

  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages,
    filters,
    isListLoading,
    isActionLoading,
    error,
    refresh,
    changePage,
    setPageSize: changePageSize,
    updateFilters,
    updateSearch,
    createAdat,
    updateAdat,
    deleteAdat,
    isEmpty: useMemo(() => !isListLoading && items.length === 0, [isListLoading, items.length]),
  };
};
