"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { AdminBookingListItemDTO } from "@wo/shared-types";

import { bookingsApi } from "../services/bookings-api";
import type { BookingListFilters, BookingListResult } from "../types";

const defaultFilters: BookingListFilters = {
  status: "ALL",
  sortBy: "bookedAt",
  sortDirection: "desc",
};

export type BookingManagementInitialState = {
  list: BookingListResult;
  queryState: {
    page: number;
    pageSize: number;
    filters: BookingListFilters;
  };
};

export const useBookingManagement = (initialState?: BookingManagementInitialState) => {
  const [items, setItems] = useState<AdminBookingListItemDTO[]>(initialState?.list.items ?? []);
  const [page, setPage] = useState(initialState?.queryState.page ?? 1);
  const [pageSize, setPageSize] = useState(initialState?.queryState.pageSize ?? 10);
  const [totalItems, setTotalItems] = useState(initialState?.list.totalItems ?? 0);
  const [totalPages, setTotalPages] = useState(initialState?.list.totalPages ?? 1);
  const [filters, setFilters] = useState<BookingListFilters>(
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

  const loadBookings = useCallback(async () => {
    const requestId = nextRequestId();
    setIsListLoading(true);
    setError(null);

    try {
      const response = await bookingsApi.list({
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

      setError(loadError instanceof Error ? loadError.message : "Failed to load bookings");
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
    void loadBookings();
  }, [loadBookings]);

  const refresh = useCallback(async () => {
    await loadBookings();
  }, [loadBookings]);

  const changePage = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  const changePageSize = useCallback((nextSize: number) => {
    setPageSize(nextSize);
    setPage(1);
  }, []);

  const updateFilters = useCallback((patch: Partial<BookingListFilters>) => {
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
