"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { AdminPaymentProofListItemDTO } from "@wo/shared-types";

import { paymentsApi } from "../services/payments-api";
import type { PaymentProofListFilters } from "../types";

const defaultFilters: PaymentProofListFilters = {
  paymentProofStatus: "ALL",
  bookingStatus: "ALL",
  sortBy: "createdAt",
  sortDirection: "desc",
};

export const usePaymentMonitoring = () => {
  const [items, setItems] = useState<AdminPaymentProofListItemDTO[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<PaymentProofListFilters>(defaultFilters);

  const [isListLoading, setIsListLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);

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
      const response = await paymentsApi.list({
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
