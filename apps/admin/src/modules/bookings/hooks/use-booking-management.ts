"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { AdminBookingListItemDTO } from "@wo/shared-types";

import { bookingsApi } from "../services/bookings-api";
import type { BookingListFilters } from "../types";

const defaultFilters: BookingListFilters = {
  status: "ALL",
  sortBy: "bookedAt",
  sortDirection: "desc",
};

export const useBookingManagement = () => {
  const [items, setItems] = useState<AdminBookingListItemDTO[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<BookingListFilters>(defaultFilters);

  const [isListLoading, setIsListLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
