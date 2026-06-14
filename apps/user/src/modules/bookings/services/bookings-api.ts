"use client";

import type { CreateBookingApiPayload, UserBookingDetailDTO } from "../types";

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
