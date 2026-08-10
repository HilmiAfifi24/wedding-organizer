import { RunPaymentRemindersUseCase } from "@/core/application/use-cases/payment-reminder-use-cases";
import { PrismaPaymentReminderRepository } from "@/core/infrastructure/db/repositories";
import { FonnteWhatsAppNotificationService } from "@/core/infrastructure/notifications/fonnte-whatsapp-notification-service";

export const createPaymentReminderUseCases = () => {
  const repository = new PrismaPaymentReminderRepository();
  const notificationService = new FonnteWhatsAppNotificationService();

  return {
    repository,
    notificationService,
    runPaymentRemindersUseCase: new RunPaymentRemindersUseCase(repository, notificationService),
  };
};
