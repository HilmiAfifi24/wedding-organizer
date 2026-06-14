"use client";

import type {
  CreateBookingApiPayload,
  UserBookingDetailDTO,
  UserBookingListItemDTO,
  UserBookingListQuery,
  UserBookingTimelineItemDTO,
} from "../types";
import type { PaginatedResult } from "@wo/shared-types";

type ApiSuccess<T> = {
  success: true;
  data: T;
  message: string;
};

type ApiError = {
  success: false;
  message: string;
  details?: unknown;
};

const parseResponse = async <T>(response: Response): Promise<ApiSuccess<T>> => {
  const body = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiError | null;

  if (!response.ok || !body || body.success === false) {
    throw new Error((body as ApiError | null)?.message || "Request failed");
  }

  return body;
};

export const bookingsApi = {
  async list(query: Partial<UserBookingListQuery>) {
    const searchParams = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      searchParams.set(key, value instanceof Date ? value.toISOString() : String(value));
    });

    const response = await fetch(`/api/user/bookings?${searchParams.toString()}`, {
      method: "GET",
      cache: "no-store",
    });

    return parseResponse<PaginatedResult<UserBookingListItemDTO>>(response);
  },

  async detail(bookingId: string) {
    const response = await fetch(`/api/user/bookings/${bookingId}`, {
      method: "GET",
      cache: "no-store",
    });

    return parseResponse<UserBookingDetailDTO>(response);
  },

  async timeline(bookingId: string) {
    const response = await fetch(`/api/user/bookings/${bookingId}/timeline`, {
      method: "GET",
      cache: "no-store",
    });

    return parseResponse<UserBookingTimelineItemDTO[]>(response);
  },

  async create(payload: CreateBookingApiPayload) {
    const response = await fetch("/api/user/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return parseResponse<UserBookingDetailDTO>(response);
  },
};
