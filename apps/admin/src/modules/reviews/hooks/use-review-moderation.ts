"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { AdminReviewListItemDTO } from "@wo/shared-types";

import { reviewsApi } from "../services/reviews-api";
import type { ReviewListFilters } from "../types";

const defaultFilters: ReviewListFilters = {
  status: "ALL",
  rating: "ALL",
  sortBy: "createdAt",
  sortDirection: "desc",
};

export const useReviewModeration = () => {
  const [items, setItems] = useState<AdminReviewListItemDTO[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<ReviewListFilters>(defaultFilters);

  const [isListLoading, setIsListLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  const nextRequestId = () => {
    requestIdRef.current += 1;
    return requestIdRef.current;
  };

  const isLatestRequest = (id: number) => requestIdRef.current === id;

  const loadReviews = useCallback(async () => {
    const requestId = nextRequestId();
    setIsListLoading(true);
    setError(null);

    try {
      const response = await reviewsApi.list({
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

      setError(loadError instanceof Error ? loadError.message : "Failed to load reviews");
    } finally {
      if (isLatestRequest(requestId)) {
        setIsListLoading(false);
      }
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadReviews();
  }, [loadReviews]);

  const refresh = useCallback(async () => {
    await loadReviews();
  }, [loadReviews]);

  const changePage = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  const changePageSize = useCallback((nextSize: number) => {
    setPageSize(nextSize);
    setPage(1);
  }, []);

  const updateFilters = useCallback((patch: Partial<ReviewListFilters>) => {
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
        await loadReviews();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : fallbackMessage);
        throw actionError;
      } finally {
        setIsActionLoading(false);
      }
    },
    [loadReviews]
  );

  const hideReview = useCallback(
    async (reviewId: string, reason: string) => {
      await runAction(() => reviewsApi.hide(reviewId, reason), "Failed to hide review");
    },
    [runAction]
  );

  const unhideReview = useCallback(
    async (reviewId: string, reason?: string) => {
      await runAction(() => reviewsApi.unhide(reviewId, reason), "Failed to unhide review");
    },
    [runAction]
  );

  const deleteReview = useCallback(
    async (reviewId: string, reason: string) => {
      await runAction(() => reviewsApi.softDelete(reviewId, reason), "Failed to delete review");
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
    hideReview,
    unhideReview,
    deleteReview,
    isEmpty: useMemo(() => !isListLoading && items.length === 0, [isListLoading, items.length]),
  };
};
