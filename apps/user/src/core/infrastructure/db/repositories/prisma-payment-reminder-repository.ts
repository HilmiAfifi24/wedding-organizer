import "server-only";

import {
  PaymentReminderStatus,
  PaymentReminderType,
  PaymentTermStatus,
  PaymentType,
} from "@wo/shared-types";

import type {
  CreatePaymentReminderLogInput,
  PaymentReminderCandidateDTO,
  PaymentReminderRepository,
  UpdatePaymentReminderLogInput,
} from "@/core/domain/repositories/payment-reminder-repository";

import { prisma } from "../prisma";

const ACTIVE_TERM_STATUSES: PaymentTermStatus[] = [
  PaymentTermStatus.UNPAID,
  PaymentTermStatus.REJECTED,
  PaymentTermStatus.OVERDUE,
];

const mapPaymentType = (value: string) => value as PaymentType;
const mapPaymentTermStatus = (value: string) => value as PaymentTermStatus;
const mapPaymentReminderType = (value: string) => value as PaymentReminderType;
const mapPaymentReminderStatus = (value: string) => value as PaymentReminderStatus;

export class PrismaPaymentReminderRepository implements PaymentReminderRepository {
  async listReminderCandidates(): Promise<PaymentReminderCandidateDTO[]> {
    const terms = await prisma.paymentTerm.findMany({
      where: {
        dueDate: {
          not: null,
        },
        status: {
          in: ACTIVE_TERM_STATUSES,
        },
      },
      orderBy: [
        {
          dueDate: "asc",
        },
        {
          sequence: "asc",
        },
      ],
      include: {
        booking: {
          select: {
            id: true,
            bookingCode: true,
            customerName: true,
            customerPhone: true,
            eventDate: true,
            vendor: {
              select: {
                businessName: true,
              },
            },
          },
        },
        reminderLogs: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            reminderType: true,
            status: true,
            sentAt: true,
            createdAt: true,
          },
        },
      },
    });

    return terms
      .filter((term) => Boolean(term.dueDate) && Boolean(term.booking.vendor.businessName))
      .map((term) => ({
        paymentTermId: term.id,
        bookingId: term.booking.id,
        bookingCode: term.booking.bookingCode,
        customerName: term.booking.customerName,
        customerPhone: term.booking.customerPhone,
        dueDate: term.dueDate as Date,
        amount: term.amount,
        termType: mapPaymentType(term.type),
        termSequence: term.sequence,
        termStatus: mapPaymentTermStatus(term.status),
        vendorBusinessName: term.booking.vendor.businessName as string,
        eventDate: term.booking.eventDate,
        reminderLogs: term.reminderLogs.map((log) => ({
          id: log.id,
          reminderType: mapPaymentReminderType(log.reminderType),
          status: mapPaymentReminderStatus(log.status),
          sentAt: log.sentAt,
          createdAt: log.createdAt,
        })),
      }));
  }

  async markTermOverdue(paymentTermId: string, markedAt: Date): Promise<void> {
    await prisma.paymentTerm.updateMany({
      where: {
        id: paymentTermId,
        status: {
          in: [PaymentTermStatus.UNPAID, PaymentTermStatus.REJECTED],
        },
      },
      data: {
        status: PaymentTermStatus.OVERDUE,
        overdueMarkedAt: markedAt,
      },
    });
  }

  async createReminderLog(input: CreatePaymentReminderLogInput): Promise<{ reminderLogId: string }> {
    const created = await prisma.paymentReminderLog.create({
      data: {
        paymentTermId: input.paymentTermId,
        channel: input.channel,
        reminderType: input.reminderType,
        recipientPhone: input.recipientPhone,
        provider: input.provider,
        status: PaymentReminderStatus.PENDING,
        requestPayload: input.requestPayload ? JSON.parse(JSON.stringify(input.requestPayload)) : undefined,
      },
      select: {
        id: true,
      },
    });

    return {
      reminderLogId: created.id,
    };
  }

  async markReminderSent(input: UpdatePaymentReminderLogInput, sentAt: Date): Promise<void> {
    await prisma.paymentReminderLog.update({
      where: {
        id: input.reminderLogId,
      },
      data: {
        status: PaymentReminderStatus.SENT,
        providerMessageId: input.providerMessageId ?? null,
        responsePayload: input.responsePayload ? JSON.parse(JSON.stringify(input.responsePayload)) : undefined,
        errorMessage: null,
        sentAt,
      },
    });
  }

  async markReminderFailed(input: UpdatePaymentReminderLogInput): Promise<void> {
    await prisma.paymentReminderLog.update({
      where: {
        id: input.reminderLogId,
      },
      data: {
        status: PaymentReminderStatus.FAILED,
        providerMessageId: input.providerMessageId ?? null,
        responsePayload: input.responsePayload ? JSON.parse(JSON.stringify(input.responsePayload)) : undefined,
        errorMessage: input.errorMessage ?? "Unknown reminder failure",
      },
    });
  }

  async touchPaymentTermReminder(
    paymentTermId: string,
    reminderType: PaymentReminderType,
    sentAt: Date
  ): Promise<void> {
    await prisma.paymentTerm.update({
      where: {
        id: paymentTermId,
      },
      data: {
        lastReminderSentAt: sentAt,
        lastReminderType: mapPaymentReminderType(reminderType),
      },
    });
  }
}
