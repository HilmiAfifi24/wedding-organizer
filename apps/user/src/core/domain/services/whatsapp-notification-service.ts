export interface SendWhatsAppMessageInput {
  to: string;
  message: string;
}

export interface SendWhatsAppMessageResult {
  normalizedPhone: string;
  providerMessageId?: string | null;
  requestPayload?: unknown;
  responsePayload?: unknown;
}

export interface WhatsAppNotificationService {
  sendMessage(input: SendWhatsAppMessageInput): Promise<SendWhatsAppMessageResult>;
}
