"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { VendorPaymentListItemDTO } from "@/core/application/dto/payments/vendor-payment-management-dto";

import { vendorPaymentsApi } from "../services/payments-api";
import type { PaymentProofListFilters, VendorPaymentListResult } from "../types";

const defaultFilters: PaymentProofListFilters = {
  paymentProofStatus: "ALL",
  sortBy: "createdAt",
  sortDirection: "desc",
};

export type PaymentManagementInitialState = {
  list: VendorPaymentListResult;
  queryState: {
    page: number;
    pageSize: number;
    filters: PaymentProofListFilters;
  };
};

export const usePaymentManagement = (initialState?: PaymentManagementInitialState) => {
  const [items, setItems] = useState<VendorPaymentListItemDTO[]>(initialState?.list.items ?? []);
  const [page, setPage] = useState(initialState?.queryState.page ?? 1);
  const [pageSize, setPageSize] = useState(initialState?.queryState.pageSize ?? 10);
  const [totalItems, setTotalItems] = useState(initialState?.list.totalItems ?? 0);
  const [totalPages, setTotalPages] = useState(initialState?.list.totalPages ?? 1);
  const [filters, setFilters] = useState<PaymentProofListFilters>(
    initialState?.queryState.filters ?? defaultFilters
  );

  const [isListLoading, setIsListLoading] = useState(!initialState);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const skipInitialLoadRef = useRef(Boolean(initialState));

  const nextRequestId = () => {
    requestIdRef.current += 1;
    return requestIdRef.current;
  };

  const isLatestRequest = (id: number) => requestIdRef.current === id;

  const loadPaymentProofs = useCallback(async () => {
    const requestId = nextRequestId();
    setIsListLoading(true);
    setError(null);

    try {
      const response = await vendorPaymentsApi.list({
        page,
        pageSize,
        filters,
      });

      if (!isLatestRequest(requestId)) {
        return;
      }

      setItems(response.items);
      setTotalItems(response.totalItems);
      setTotalPages(response.totalPages);
    } catch (loadError) {
      if (!isLatestRequest(requestId)) {
        return;
      }

      setError(loadError instanceof Error ? loadError.message : "Failed to load payment proofs");
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

    void loadPaymentProofs();
  }, [loadPaymentProofs]);

  const refresh = useCallback(async () => {
    await loadPaymentProofs();
  }, [loadPaymentProofs]);

  const changePage = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  const changePageSize = useCallback((nextSize: number) => {
    setPageSize(nextSize);
    setPage(1);
  }, []);

  const updateFilters = useCallback((patch: Partial<PaymentProofListFilters>) => {
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

  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages,
    filters,
    isListLoading,
    error,
    refresh,
    changePage,
    setPageSize: changePageSize,
    updateFilters,
    updateSearch,
    isEmpty: useMemo(() => !isListLoading && items.length === 0, [isListLoading, items.length]),
  };
};
