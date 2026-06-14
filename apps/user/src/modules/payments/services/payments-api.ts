"use client";

import type { UserPaymentProofDetailDTO } from "../types";

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

export const paymentsApi = {
  async uploadProof(payload: {
    bookingId: string;
    paymentTermId: string;
    amount: number;
    file: File;
    note?: string;
  }) {
    const formData = new FormData();
    formData.set("bookingId", payload.bookingId);
    formData.set("paymentTermId", payload.paymentTermId);
    formData.set("amount", String(payload.amount));
    formData.set("file", payload.file);
    if (payload.note) {
      formData.set("note", payload.note);
    }

    const response = await fetch(`/api/user/payment-terms/${payload.paymentTermId}/upload-proof`, {
      method: "POST",
      body: formData,
    });

    return parseResponse<UserPaymentProofDetailDTO>(response);
  },
};
