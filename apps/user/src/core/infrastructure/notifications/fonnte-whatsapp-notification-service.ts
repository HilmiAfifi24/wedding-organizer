import "server-only";

import { INDONESIAN_PHONE_REGEX } from "@wo/shared-types";

import type {
  SendWhatsAppMessageInput,
  SendWhatsAppMessageResult,
  WhatsAppNotificationService,
} from "@/core/domain/services/whatsapp-notification-service";

const DEFAULT_TIMEOUT_SECONDS = 15;

export class WhatsAppNotificationError extends Error {
  constructor(
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "WhatsAppNotificationError";
  }
}

const normalizePhoneNumber = (value: string) => {
  const sanitized = value.replace(/[^\d+]/g, "");

  if (!INDONESIAN_PHONE_REGEX.test(sanitized)) {
    throw new WhatsAppNotificationError("Nomor WhatsApp customer tidak valid", {
      phone: value,
    });
  }

  if (sanitized.startsWith("+62")) {
    return sanitized.slice(1);
  }

  if (sanitized.startsWith("62")) {
    return sanitized;
  }

  return `62${sanitized.slice(1)}`;
};

const getTimeoutMs = () => {
  const parsed = Number.parseInt(process.env.FONNTE_TIMEOUT_SECONDS || "", 10);
  return (Number.isNaN(parsed) ? DEFAULT_TIMEOUT_SECONDS : parsed) * 1000;
};

export class FonnteWhatsAppNotificationService implements WhatsAppNotificationService {
  async sendMessage(input: SendWhatsAppMessageInput): Promise<SendWhatsAppMessageResult> {
    const token = process.env.FONNTE_API_TOKEN;
    const baseUrl = process.env.FONNTE_BASE_URL || "https://api.fonnte.com";

    if (!token) {
      throw new WhatsAppNotificationError("FONNTE_API_TOKEN belum dikonfigurasi");
    }

    const normalizedPhone = normalizePhoneNumber(input.to);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), getTimeoutMs());
    const payload = {
      target: normalizedPhone,
      message: input.message,
      countryCode: "62",
    };

    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const responsePayload = (await response.json().catch(() => null)) as
        | {
            id?: string | number;
            status?: boolean | string;
            detail?: string;
            reason?: string;
          }
        | null;

      if (!response.ok || responsePayload?.status === false) {
        throw new WhatsAppNotificationError("Gagal mengirim notifikasi WhatsApp via Fonnte", {
          status: response.status,
          responsePayload,
        });
      }

      return {
        normalizedPhone,
        providerMessageId:
          typeof responsePayload?.id === "string" || typeof responsePayload?.id === "number"
            ? String(responsePayload.id)
            : null,
        requestPayload: payload,
        responsePayload,
      };
    } catch (error) {
      if (error instanceof WhatsAppNotificationError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new WhatsAppNotificationError("Request Fonnte timeout", {
          timeoutMs: getTimeoutMs(),
        });
      }

      throw new WhatsAppNotificationError("Gagal menghubungi Fonnte", {
        cause: error instanceof Error ? error.message : String(error),
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}
