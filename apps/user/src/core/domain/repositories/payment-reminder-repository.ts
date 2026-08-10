import type {
  PaymentReminderChannel,
  PaymentReminderStatus,
  PaymentReminderType,
  PaymentTermStatus,
  PaymentType,
} from "@wo/shared-types";

export interface PaymentReminderCandidateDTO {
  paymentTermId: string;
  bookingId: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  dueDate: Date;
  amount: number;
  termType: PaymentType;
  termSequence: number;
  termStatus: PaymentTermStatus;
  vendorBusinessName: string;
  eventDate: Date;
  reminderLogs: Array<{
    id: string;
    reminderType: PaymentReminderType;
    status: PaymentReminderStatus;
    sentAt?: Date | null;
    createdAt: Date;
  }>;
}

export interface CreatePaymentReminderLogInput {
  paymentTermId: string;
  channel: PaymentReminderChannel;
  reminderType: PaymentReminderType;
  recipientPhone: string;
  provider: string;
  requestPayload?: unknown;
}

export interface UpdatePaymentReminderLogInput {
  reminderLogId: string;
  providerMessageId?: string | null;
  responsePayload?: unknown;
  errorMessage?: string | null;
}

export interface PaymentReminderRepository {
  listReminderCandidates(referenceDate: Date): Promise<PaymentReminderCandidateDTO[]>;
  markTermOverdue(paymentTermId: string, markedAt: Date): Promise<void>;
  createReminderLog(input: CreatePaymentReminderLogInput): Promise<{ reminderLogId: string }>;
  markReminderSent(input: UpdatePaymentReminderLogInput, sentAt: Date): Promise<void>;
  markReminderFailed(input: UpdatePaymentReminderLogInput): Promise<void>;
  touchPaymentTermReminder(
    paymentTermId: string,
    reminderType: PaymentReminderType,
    sentAt: Date
  ): Promise<void>;
}
