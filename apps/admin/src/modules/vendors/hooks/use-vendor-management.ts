"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { AdminVendorDetailDTO, AdminVendorListItemDTO } from "@wo/shared-types";

import { vendorsApi } from "../services/vendors-api";
import type { VendorListFilters } from "../types";

const defaultFilters: VendorListFilters = {
  status: "ALL",
  sortBy: "createdAt",
  sortDirection: "desc",
  includeDeleted: false,
};

export const useVendorManagement = () => {
  const [items, setItems] = useState<AdminVendorListItemDTO[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<VendorListFilters>(defaultFilters);

  const [isListLoading, setIsListLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminVendorDetailDTO | null>(null);

  const requestIdRef = useRef(0);

  const nextRequestId = () => {
    requestIdRef.current += 1;
    return requestIdRef.current;
  };

  const isLatestRequest = (id: number) => requestIdRef.current === id;

  const clearError = () => setError(null);

  const loadVendors = useCallback(async () => {
    const requestId = nextRequestId();
    setIsListLoading(true);
    setError(null);

    try {
      const response = await vendorsApi.list({
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
      setError(loadError instanceof Error ? loadError.message : "Failed to load vendors");
    } finally {
      if (isLatestRequest(requestId)) {
        setIsListLoading(false);
      }
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadVendors();
  }, [loadVendors]);

  const refresh = useCallback(async () => {
    await loadVendors();
  }, [loadVendors]);

  const changePage = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  const changePageSize = useCallback((nextSize: number) => {
    setPageSize(nextSize);
    setPage(1);
  }, []);

  const updateFilters = useCallback((patch: Partial<VendorListFilters>) => {
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

  const openDetail = useCallback(async (vendorId: string, includeHistory = false) => {
    setIsDetailLoading(true);
    setError(null);

    try {
      const response = await vendorsApi.detail(vendorId, {
        includeDeleted: true,
        includeHistory,
      });
      setDetail(response);
      return response;
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : "Failed to load vendor detail");
      return null;
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  const closeDetail = useCallback(() => {
    setDetail(null);
  }, []);

  const runAction = useCallback(
    async (action: () => Promise<unknown>, fallbackMessage: string) => {
      setIsActionLoading(true);
      setError(null);

      try {
        await action();
        await loadVendors();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : fallbackMessage);
        throw actionError;
      } finally {
        setIsActionLoading(false);
      }
    },
    [loadVendors]
  );

  const approveVendor = useCallback(
    async (vendorId: string) => {
      await runAction(() => vendorsApi.approve(vendorId), "Failed to approve vendor");
    },
    [runAction]
  );

  const rejectVendor = useCallback(
    async (vendorId: string, reason: string) => {
      await runAction(() => vendorsApi.reject(vendorId, reason), "Failed to reject vendor");
    },
    [runAction]
  );

  const suspendVendor = useCallback(
    async (vendorId: string) => {
      await runAction(() => vendorsApi.suspend(vendorId), "Failed to suspend vendor");
    },
    [runAction]
  );

  const unsuspendVendor = useCallback(
    async (vendorId: string) => {
      await runAction(() => vendorsApi.unsuspend(vendorId), "Failed to unsuspend vendor");
    },
    [runAction]
  );

  const deleteVendor = useCallback(
    async (vendorId: string) => {
      await runAction(() => vendorsApi.softDelete(vendorId), "Failed to delete vendor");
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
    approveVendor,
    rejectVendor,
    suspendVendor,
    unsuspendVendor,
    deleteVendor,

    isEmpty: useMemo(() => !isListLoading && items.length === 0, [isListLoading, items.length]),
  };
};
