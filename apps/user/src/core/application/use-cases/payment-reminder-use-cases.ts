import {
  PaymentReminderChannel,
  PaymentReminderStatus,
  PaymentReminderType,
  PaymentTermStatus,
} from "@wo/shared-types";

import type { PaymentReminderCandidateDTO, PaymentReminderRepository } from "@/core/domain/repositories/payment-reminder-repository";
import type { WhatsAppNotificationService } from "@/core/domain/services/whatsapp-notification-service";
import { buildPaymentReminderMessage } from "@/core/infrastructure/notifications/payment-reminder-message-builder";

export interface RunPaymentRemindersResult {
  processedCount: number;
  sentCount: number;
  failedCount: number;
  overdueMarkedCount: number;
  skippedCount: number;
}

const JAKARTA_TIME_ZONE = "Asia/Jakarta";

const toJakartaDayKey = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: JAKARTA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const getDaysUntilDueDate = (referenceDate: Date, dueDate: Date) => {
  const referenceKey = new Date(`${toJakartaDayKey(referenceDate)}T00:00:00+07:00`).getTime();
  const dueKey = new Date(`${toJakartaDayKey(dueDate)}T00:00:00+07:00`).getTime();

  return Math.round((dueKey - referenceKey) / 86_400_000);
};

const resolveReminderType = (candidate: PaymentReminderCandidateDTO, referenceDate: Date) => {
  const daysUntilDue = getDaysUntilDueDate(referenceDate, candidate.dueDate);

  if (daysUntilDue === 7) {
    return PaymentReminderType.D7;
  }

  if (daysUntilDue === 1) {
    return PaymentReminderType.D1;
  }

  if (daysUntilDue === 0) {
    return PaymentReminderType.D0;
  }

  if (daysUntilDue < 0) {
    return PaymentReminderType.OVERDUE;
  }

  return null;
};

const hasSentReminder = (
  candidate: PaymentReminderCandidateDTO,
  reminderType: PaymentReminderType
) =>
  candidate.reminderLogs.some(
    (log) => log.reminderType === reminderType && log.status === PaymentReminderStatus.SENT
  );

export class RunPaymentRemindersUseCase {
  constructor(
    private readonly repository: PaymentReminderRepository,
    private readonly notificationService: WhatsAppNotificationService
  ) {}

  async execute(referenceDate = new Date()): Promise<RunPaymentRemindersResult> {
    const candidates = await this.repository.listReminderCandidates(referenceDate);
    const result: RunPaymentRemindersResult = {
      processedCount: 0,
      sentCount: 0,
      failedCount: 0,
      overdueMarkedCount: 0,
      skippedCount: 0,
    };

    for (const candidate of candidates) {
      const reminderType = resolveReminderType(candidate, referenceDate);

      if (!reminderType) {
        result.skippedCount += 1;
        continue;
      }

      if (hasSentReminder(candidate, reminderType)) {
        result.skippedCount += 1;
        continue;
      }

      result.processedCount += 1;

      if (
        reminderType === PaymentReminderType.OVERDUE &&
        (candidate.termStatus === PaymentTermStatus.UNPAID ||
          candidate.termStatus === PaymentTermStatus.REJECTED)
      ) {
        await this.repository.markTermOverdue(candidate.paymentTermId, referenceDate);
        result.overdueMarkedCount += 1;
      }

      const message = buildPaymentReminderMessage(candidate, reminderType);
      const reminderLog = await this.repository.createReminderLog({
        paymentTermId: candidate.paymentTermId,
        channel: PaymentReminderChannel.WHATSAPP,
        reminderType,
        recipientPhone: candidate.customerPhone,
        provider: "FONNTE",
        requestPayload: {
          bookingCode: candidate.bookingCode,
          reminderType,
          recipientPhone: candidate.customerPhone,
          message,
        },
      });

      try {
        const response = await this.notificationService.sendMessage({
          to: candidate.customerPhone,
          message,
        });

        await this.repository.markReminderSent(
          {
            reminderLogId: reminderLog.reminderLogId,
            providerMessageId: response.providerMessageId,
            responsePayload: response.responsePayload,
          },
          referenceDate
        );
        await this.repository.touchPaymentTermReminder(candidate.paymentTermId, reminderType, referenceDate);

        result.sentCount += 1;
      } catch (error) {
        await this.repository.markReminderFailed({
          reminderLogId: reminderLog.reminderLogId,
          errorMessage: error instanceof Error ? error.message : "Unknown reminder error",
          responsePayload:
            error instanceof Error
              ? {
                  name: error.name,
                  message: error.message,
                }
              : {
                  message: String(error),
                },
        });

        result.failedCount += 1;
      }
    }

    return result;
  }
}
