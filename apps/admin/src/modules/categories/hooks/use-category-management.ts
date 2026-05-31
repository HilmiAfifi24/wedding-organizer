"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { AdminCategoryListItemDTO } from "@wo/shared-types";

import { categoriesApi } from "../services/categories-api";
import type { CategoryListFilters, CategoryListResult } from "../types";

const defaultFilters: CategoryListFilters = {
  sortBy: "name",
  sortDirection: "asc",
};

const normalizeCategoryItem = (item: AdminCategoryListItemDTO): AdminCategoryListItemDTO => ({
  ...item,
  createdAt: new Date(item.createdAt),
  updatedAt: new Date(item.updatedAt),
});

export type CategoryManagementInitialState = {
  list: CategoryListResult;
  queryState: {
    page: number;
    pageSize: number;
    filters: CategoryListFilters;
  };
};

export const useCategoryManagement = (initialState?: CategoryManagementInitialState) => {
  const [items, setItems] = useState<AdminCategoryListItemDTO[]>(
    initialState?.list.items.map(normalizeCategoryItem) ?? []
  );
  const [page, setPage] = useState(initialState?.queryState.page ?? 1);
  const [pageSize, setPageSize] = useState(initialState?.queryState.pageSize ?? 10);
  const [totalItems, setTotalItems] = useState(initialState?.list.totalItems ?? 0);
  const [totalPages, setTotalPages] = useState(initialState?.list.totalPages ?? 1);
  const [filters, setFilters] = useState<CategoryListFilters>(
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

  const loadCategories = useCallback(async () => {
    const requestId = nextRequestId();
    setIsListLoading(true);
    setError(null);

    try {
      const response = await categoriesApi.list({
        page,
        pageSize,
        filters,
      });

      if (!isLatestRequest(requestId)) {
        return;
      }

      setItems(response.items.map(normalizeCategoryItem));
      setTotalItems(response.totalItems);
      setTotalPages(response.totalPages);
    } catch (loadError) {
      if (!isLatestRequest(requestId)) {
        return;
      }

      setError(loadError instanceof Error ? loadError.message : "Failed to load categories");
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

    void loadCategories();
  }, [loadCategories]);

  const refresh = useCallback(async () => {
    await loadCategories();
  }, [loadCategories]);

  const changePage = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  const changePageSize = useCallback((nextSize: number) => {
    setPageSize(nextSize);
    setPage(1);
  }, []);

  const updateFilters = useCallback((patch: Partial<CategoryListFilters>) => {
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
        await loadCategories();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : fallbackMessage);
        throw actionError;
      } finally {
        setIsActionLoading(false);
      }
    },
    [loadCategories]
  );

  const createCategory = useCallback(
    async (name: string) => {
      await runAction(
        () => categoriesApi.create({ name }),
        "Failed to create category"
      );
    },
    [runAction]
  );

  const updateCategory = useCallback(
    async (categoryId: string, name: string) => {
      await runAction(
        () => categoriesApi.update(categoryId, { name }),
        "Failed to update category"
      );
    },
    [runAction]
  );

  const deleteCategory = useCallback(
    async (categoryId: string) => {
      await runAction(() => categoriesApi.remove(categoryId), "Failed to delete category");
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
    createCategory,
    updateCategory,
    deleteCategory,
    isEmpty: useMemo(() => !isListLoading && items.length === 0, [isListLoading, items.length]),
  };
};
