import {
  AuditModule,
  PaymentTermStatus,
  PaymentType,
  Role,
  UserStatus,
} from "@wo/shared-types";
import type { UserSessionDTO } from "@wo/shared-types";

import type {
  BookingRepository,
  CreateUserBookingInput,
  UserBookingDetailDTO,
  UserBookingListItemDTO,
  UserBookingListQuery,
  UserBookingTimelineItemDTO,
} from "@/core/domain/repositories";
import type { PaginatedResult } from "@wo/shared-types";

const APPROVED_VENDOR_STATUS = "APPROVED";
const DEFAULT_PAYMENT_TERM_DISTRIBUTION = [
  { type: PaymentType.DP, percentage: 0.3 },
  { type: PaymentType.INSTALLMENT, percentage: 0.5 },
  { type: PaymentType.FINAL_PAYMENT, percentage: 0.2 },
] as const;

const buildDefaultPaymentTerms = (totalAmount: number) => {
  const dpAmount = Math.round(totalAmount * DEFAULT_PAYMENT_TERM_DISTRIBUTION[0].percentage);
  const installmentAmount = Math.round(
    totalAmount * DEFAULT_PAYMENT_TERM_DISTRIBUTION[1].percentage
  );
  const finalAmount = Math.max(totalAmount - dpAmount - installmentAmount, 0);

  return [
    {
      type: PaymentType.DP,
      amount: dpAmount,
      status: PaymentTermStatus.UNPAID,
      sequence: 1,
      dueDate: null,
    },
    {
      type: PaymentType.INSTALLMENT,
      amount: installmentAmount,
      status: PaymentTermStatus.UNPAID,
      sequence: 2,
      dueDate: null,
    },
    {
      type: PaymentType.FINAL_PAYMENT,
      amount: finalAmount,
      status: PaymentTermStatus.UNPAID,
      sequence: 3,
      dueDate: null,
    },
  ];
};

const isPastEventDate = (eventDate: Date) => {
  const today = new Date();
  const todayBoundary = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const eventBoundary = new Date(
    eventDate.getFullYear(),
    eventDate.getMonth(),
    eventDate.getDate()
  );

  return eventBoundary < todayBoundary;
};

const ensureActiveUserSession = (session: UserSessionDTO | null) => {
  if (!session?.userId) {
    throw new Error("Unauthorized: user session not found");
  }

  if (session.role !== Role.USER) {
    throw new Error("Forbidden: only USER can create booking");
  }

  if (session.status !== UserStatus.ACTIVE) {
    throw new Error("Forbidden: only active USER can create booking");
  }

  return session;
};

export class CreateUserBookingUseCase {
  constructor(private readonly repository: BookingRepository) {}

  async execute(input: CreateUserBookingInput, actor: UserSessionDTO): Promise<UserBookingDetailDTO> {
    const session = ensureActiveUserSession(actor);

    if (isPastEventDate(input.eventDate)) {
      throw new Error("Tanggal acara tidak boleh di masa lalu");
    }

    const target = await this.repository.getBookingTarget(input.vendorId, input.serviceId);

    if (!target.vendor) {
      throw new Error("Vendor tidak ditemukan");
    }

    if (target.vendor.deletedAt || target.vendor.suspendedAt) {
      throw new Error("Vendor tidak tersedia untuk booking");
    }

    if (target.vendor.status !== APPROVED_VENDOR_STATUS) {
      throw new Error("Vendor tidak tersedia untuk booking");
    }

    if (!target.service || target.service.vendorId !== target.vendor.id) {
      throw new Error("Layanan vendor tidak ditemukan");
    }

    if (!target.service.isActive) {
      throw new Error("Layanan vendor sedang tidak aktif");
    }

    const hasDuplicate = await this.repository.hasActiveDuplicateBooking({
      userId: session.userId,
      vendorId: input.vendorId,
      serviceId: input.serviceId,
      eventDate: input.eventDate,
    });

    if (hasDuplicate) {
      throw new Error("Booking aktif untuk vendor, layanan, dan tanggal acara ini sudah ada");
    }

    return this.repository.create(
      {
        ...input,
        userId: session.userId,
        totalAmount: target.service.price,
        paymentTerms: buildDefaultPaymentTerms(target.service.price),
      },
      {
        actorId: session.userId,
        module: AuditModule.USER_BOOKINGS,
        action: "BOOKING_CREATED",
        afterData: {
          vendorId: input.vendorId,
          serviceId: input.serviceId,
          eventDate: input.eventDate,
          totalAmount: target.service.price,
        },
      }
    );
  }
}

export class GetUserBookingDetailUseCase {
  constructor(private readonly repository: BookingRepository) {}

  async execute(bookingId: string, actor: UserSessionDTO): Promise<UserBookingDetailDTO> {
    const session = ensureActiveUserSession(actor);
    const booking = await this.repository.findDetailByIdForUser(bookingId, session.userId);

    if (!booking) {
      throw new Error("Booking tidak ditemukan");
    }

    return booking;
  }
}

export class GetUserBookingTimelineUseCase {
  constructor(private readonly repository: BookingRepository) {}

  async execute(bookingId: string, actor: UserSessionDTO): Promise<UserBookingTimelineItemDTO[]> {
    const session = ensureActiveUserSession(actor);
    const timeline = await this.repository.findTimelineByBookingIdForUser(bookingId, session.userId);

    if (!timeline) {
      throw new Error("Booking tidak ditemukan");
    }

    return timeline;
  }
}

export class ListUserBookingsUseCase {
  constructor(private readonly repository: BookingRepository) {}

  async execute(
    query: UserBookingListQuery,
    actor: UserSessionDTO
  ): Promise<PaginatedResult<UserBookingListItemDTO>> {
    const session = ensureActiveUserSession(actor);
    return this.repository.listByUser(session.userId, query);
  }
}
