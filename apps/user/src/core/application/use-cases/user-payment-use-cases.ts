import { AuditModule, BookingStatus, PaymentTermStatus, Role, UserStatus } from "@wo/shared-types";
import type { UserSessionDTO } from "@wo/shared-types";

import type { FileStorageService } from "@/core/domain/services/file-storage-service";
import type {
  CreateUserPaymentProofInput,
  UserBookingPaymentSummaryDTO,
  UserPaymentProofDetailDTO,
  UserPaymentRepository,
  UserPaymentsQuery,
  UserPaymentTermUploadContextDTO,
} from "@/core/domain/repositories/user-payment-repository";

const UPLOADABLE_BOOKING_STATUSES = new Set<BookingStatus>([
  BookingStatus.PENDING_PAYMENT,
  BookingStatus.CONFIRMED,
]);

const ensureActiveUserSession = (session: UserSessionDTO | null) => {
  if (!session?.userId) {
    throw new Error("Unauthorized: user session not found");
  }

  if (session.role !== Role.USER) {
    throw new Error("Forbidden: only USER can access payments");
  }

  if (session.status !== UserStatus.ACTIVE) {
    throw new Error("Forbidden: only active USER can access payments");
  }

  return session;
};

const assertCanUploadToTerm = (context: UserPaymentTermUploadContextDTO) => {
  if (!UPLOADABLE_BOOKING_STATUSES.has(context.bookingStatus)) {
    throw new Error("Booking ini tidak dapat menerima upload pembayaran");
  }

  if (context.term.status === PaymentTermStatus.VERIFIED) {
    throw new Error("Termin yang sudah terverifikasi tidak dapat diunggah ulang");
  }

  if (
    context.term.status !== PaymentTermStatus.UNPAID &&
    context.term.status !== PaymentTermStatus.REJECTED
  ) {
    throw new Error("Termin ini sedang menunggu verifikasi pembayaran");
  }
};

export class ListUserPaymentsUseCase {
  constructor(private readonly repository: UserPaymentRepository) {}

  async execute(query: UserPaymentsQuery, actor: UserSessionDTO) {
    const session = ensureActiveUserSession(actor);
    return this.repository.listPaymentProofsByUser(session.userId, query);
  }
}

export class GetUserPaymentProofDetailUseCase {
  constructor(private readonly repository: UserPaymentRepository) {}

  async execute(paymentProofId: string, actor: UserSessionDTO): Promise<UserPaymentProofDetailDTO> {
    const session = ensureActiveUserSession(actor);
    const detail = await this.repository.findPaymentProofByIdForUser(paymentProofId, session.userId);

    if (!detail) {
      throw new Error("Payment proof tidak ditemukan");
    }

    return detail;
  }
}

export class GetUserBookingPaymentsUseCase {
  constructor(private readonly repository: UserPaymentRepository) {}

  async execute(bookingId: string, actor: UserSessionDTO): Promise<UserBookingPaymentSummaryDTO> {
    const session = ensureActiveUserSession(actor);
    const summary = await this.repository.findBookingPaymentsByBookingIdForUser(
      bookingId,
      session.userId
    );

    if (!summary) {
      throw new Error("Pembayaran booking tidak ditemukan");
    }

    return summary;
  }
}

export class GetUserPaymentTermUseCase {
  constructor(private readonly repository: UserPaymentRepository) {}

  async execute(paymentTermId: string, actor: UserSessionDTO): Promise<UserPaymentTermUploadContextDTO> {
    const session = ensureActiveUserSession(actor);
    const context = await this.repository.findPaymentTermByIdForUser(paymentTermId, session.userId);

    if (!context) {
      throw new Error("Termin pembayaran tidak ditemukan");
    }

    return context;
  }
}

export class UploadUserPaymentProofUseCase {
  constructor(
    private readonly repository: UserPaymentRepository,
    private readonly fileStorage: FileStorageService
  ) {}

  async execute(
    input: Omit<CreateUserPaymentProofInput, "uploadedById" | "fileUrl"> & { file: File },
    actor: UserSessionDTO
  ): Promise<UserPaymentProofDetailDTO> {
    const session = ensureActiveUserSession(actor);
    const context = await this.repository.findPaymentTermByIdForUser(input.paymentTermId, session.userId);

    if (!context) {
      throw new Error("Termin pembayaran tidak ditemukan");
    }

    if (context.bookingId !== input.bookingId) {
      throw new Error("Termin pembayaran tidak cocok dengan booking");
    }

    if (input.amount <= 0) {
      throw new Error("Nominal pembayaran harus lebih dari 0");
    }

    assertCanUploadToTerm(context);

    const isReupload = context.term.status === PaymentTermStatus.REJECTED;
    const fileUrl = await this.fileStorage.upload(input.file);

    try {
      return await this.repository.createPaymentProofUpload(
        {
          bookingId: input.bookingId,
          paymentTermId: input.paymentTermId,
          uploadedById: session.userId,
          amount: input.amount,
          fileUrl,
          note: input.note,
        },
        {
          actorId: session.userId,
          module: AuditModule.USER_PAYMENTS,
          action: isReupload ? "PAYMENT_PROOF_REUPLOADED" : "PAYMENT_PROOF_UPLOADED",
          beforeData: context.term.latestProof,
          afterData: {
            bookingId: input.bookingId,
            paymentTermId: input.paymentTermId,
            amount: input.amount,
            fileType: input.file.type,
            originalName: input.file.name,
          },
        }
      );
    } catch (error) {
      await this.fileStorage.delete(fileUrl).catch(() => undefined);
      throw error;
    }
  }
}
