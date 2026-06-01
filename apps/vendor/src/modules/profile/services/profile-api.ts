import type { VendorProfileDTO, VendorVerificationChecklistDTO } from "@wo/shared-types";

import type { VendorProfilePayload, VendorProfileResubmitPayload } from "../types";

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

const parseResponse = async <T>(response: Response): Promise<T> => {
  const body = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiError | null;

  if (!response.ok || !body || body.success === false) {
    throw new Error(body?.message || "Request failed");
  }

  return body.data;
};

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    cache: "no-store",
    ...init,
  });

  return parseResponse<T>(response);
};

export const vendorProfileApi = {
  get: () => request<VendorProfileDTO>("/api/vendor/profile"),
  getChecklist: () => request<VendorVerificationChecklistDTO>("/api/vendor/profile/checklist"),
  update: (payload: VendorProfilePayload) =>
    request<VendorProfileDTO>("/api/vendor/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }),
  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return request<VendorProfileDTO>("/api/vendor/profile/logo", {
      method: "POST",
      body: formData,
    });
  },
  uploadCover: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return request<VendorProfileDTO>("/api/vendor/profile/cover", {
      method: "POST",
      body: formData,
    });
  },
  resubmit: (payload: VendorProfileResubmitPayload) =>
    request<VendorProfileDTO>("/api/vendor/profile/resubmit", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }),
};
