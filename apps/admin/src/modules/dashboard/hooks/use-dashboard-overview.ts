"use client";

import { useCallback, useState } from "react";

import { DashboardTimeRange, type AdminDashboardOverviewDTO } from "@wo/shared-types";

import { dashboardApi } from "../services/dashboard-api";

export const useDashboardOverview = (initialData: AdminDashboardOverviewDTO) => {
  const [data, setData] = useState<AdminDashboardOverviewDTO>(initialData);
  const [timeRange, setTimeRange] = useState<DashboardTimeRange>(initialData.timeRange);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTimeRange = useCallback(async (nextTimeRange: DashboardTimeRange) => {
    if (nextTimeRange === timeRange) {
      return;
    }

    setTimeRange(nextTimeRange);
    setIsRefreshing(true);
    setError(null);

    try {
      const response = await dashboardApi.overview(nextTimeRange);
      setData(response);
    } catch (refreshError) {
      setError(
        refreshError instanceof Error ? refreshError.message : "Gagal memuat dashboard overview"
      );
      setTimeRange(data.timeRange);
    } finally {
      setIsRefreshing(false);
    }
  }, [data.timeRange, timeRange]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      const response = await dashboardApi.overview(timeRange);
      setData(response);
    } catch (refreshError) {
      setError(
        refreshError instanceof Error ? refreshError.message : "Gagal memuat dashboard overview"
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [timeRange]);

  return {
    data,
    timeRange,
    isRefreshing,
    error,
    updateTimeRange,
    refresh,
  };
};
