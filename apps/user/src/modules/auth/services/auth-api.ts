"use client";

import type { UserSessionDTO } from "@wo/shared-types";

import type { ApiError, ApiResponse, ApiSuccess } from "../types";
import type { ForgotPasswordInput, RegisterInput } from "../schemas/auth";

const parseResponse = async <T>(response: Response): Promise<ApiSuccess<T>> => {
  const body = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !body || body.success === false) {
    const message = (body as ApiError | null)?.message || "Request failed";
    throw new Error(message);
  }

  return body;
};

export const authApi = {
  async register(payload: RegisterInput) {
    const response = await fetch("/api/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return parseResponse<UserSessionDTO>(response);
  },

  async requestPasswordReset(payload: ForgotPasswordInput) {
    const response = await fetch("/api/user/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return parseResponse<Record<string, never>>(response);
  },

  async logout() {
    const response = await fetch("/api/user/auth/logout", {
      method: "POST",
    });

    return parseResponse<Record<string, never>>(response);
  },
};
