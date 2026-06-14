import "server-only";
import { randomUUID } from "node:crypto";

import type {
  BookingStatus,
  ListOptions,
  PaginatedResult,
  PaymentProofStatus,
  PaymentProofStatusHistoryDTO,
  PaymentStatus,
  PaymentTermStatus,
  PaymentType,
} from "@wo/shared-types";
import { AuditModule } from "@wo/shared-types";

import type {
  BookingAuditLogInput,
  BookingRepository,
  BookingTargetSnapshotDTO,
  CreateUserBookingRecordInput,
  UserBookingDetailDTO,
  UserBookingListItemDTO,
  UserBookingListQuery,
  UserBookingPaymentProofItemDTO,
  UserBookingPaymentTermItemDTO,
  UserBookingTimelineItemDTO,
} from "../../../domain/repositories";
import { prisma } from "../prisma";

const ACTIVE_DUPLICATE_STATUSES = ["PENDING", "PENDING_PAYMENT", "CONFIRMED"] as const;
const BOOKING_CREATED_AUDIT_ACTION = "BOOKING_CREATED";
type BookingCodeClient = Pick<typeof prisma, "booking">;

const mapBookingStatus = (status: string) => status as BookingStatus;
const mapPaymentStatus = (status: string) => status as PaymentStatus;
const mapPaymentTermStatus = (status: string) => status as PaymentTermStatus;
const mapPaymentType = (type: string) => type as PaymentType;
const mapPaymentProofStatus = (status: string) => status as PaymentProofStatus;

const toJsonValue = (value: unknown) => {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value));
};

const formatJakartaDateCode = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";

  return `${year}${month}${day}`;
};

const getNextBookingCode = async (tx: BookingCodeClient, date: Date) => {
  const prefix = `WO-${formatJakartaDateCode(date)}-`;
  const latest = await tx.booking.findFirst({
    where: {
      bookingCode: {
        startsWith: prefix,
      },
    },
    orderBy: {
      bookingCode: "desc",
    },
    select: {
      bookingCode: true,
    },
  });

  const latestSequence = latest?.bookingCode.split("-").at(-1);
  const nextSequence = latestSequence ? Number.parseInt(latestSequence, 10) + 1 : 1;

  return `${prefix}${String(nextSequence).padStart(4, "0")}`;
};

const mapPaymentProofHistory = (
  history: Array<{
    id: string;
    paymentProofId: string;
    previousStatus: string | null;
    newStatus: string;
    changedById: string | null;
    note: string | null;
    isOverride: boolean;
    createdAt: Date;
    changedBy: {
      name: string | null;
    } | null;
  }>
): PaymentProofStatusHistoryDTO[] =>
  history.map((item) => ({
    id: item.id,
    paymentProofId: item.paymentProofId,
    previousStatus: item.previousStatus ? mapPaymentProofStatus(item.previousStatus) : null,
    newStatus: mapPaymentProofStatus(item.newStatus),
    changedById: item.changedById,
    changedByName: item.changedBy?.name ?? null,
    note: item.note,
    isOverride: item.isOverride,
    createdAt: item.createdAt,
  }));

const mapBookingHistory = (
  history: Array<{
    id: string;
    bookingId: string;
    previousStatus: string | null;
    newStatus: string;
    changedById: string | null;
    note: string | null;
    createdAt: Date;
    changedBy: {
      name: string | null;
    } | null;
  }>
) =>
  history.map((item) => ({
    id: item.id,
    bookingId: item.bookingId,
    previousStatus: item.previousStatus ? mapBookingStatus(item.previousStatus) : null,
    newStatus: mapBookingStatus(item.newStatus),
    changedById: item.changedById,
    changedByName: item.changedBy?.name ?? null,
    note: item.note,
    createdAt: item.createdAt,
  }));

const calculateRemainingBalance = (
  totalAmount: number,
  paymentTerms: Array<{
    amount: number;
    status: string;
  }>
) => {
  const totalPaidAmount = paymentTerms
    .filter((term) => term.status === "VERIFIED")
    .reduce((sum, term) => sum + term.amount, 0);

  return {
    totalPaidAmount,
    remainingBalance: Math.max(totalAmount - totalPaidAmount, 0),
  };
};

const mapPaymentProofItem = (proof: {
  id: string;
  bookingId: string;
  paymentTermId: string;
  amount: number;
  fileUrl: string;
  status: string;
  note: string | null;
  verificationNote: string | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  paymentTerm: {
    type: string;
    sequence: number;
  };
  statusHistory: Array<{
    id: string;
    paymentProofId: string;
    previousStatus: string | null;
    newStatus: string;
    changedById: string | null;
    note: string | null;
    isOverride: boolean;
    createdAt: Date;
    changedBy: {
      name: string | null;
    } | null;
  }>;
}): UserBookingPaymentProofItemDTO => ({
  id: proof.id,
  bookingId: proof.bookingId,
  paymentTermId: proof.paymentTermId,
  paymentTermType: mapPaymentType(proof.paymentTerm.type),
  paymentTermSequence: proof.paymentTerm.sequence,
  amount: proof.amount,
  fileUrl: proof.fileUrl,
  status: mapPaymentProofStatus(proof.status),
  note: proof.note,
  verificationNote: proof.verificationNote,
  rejectionReason: proof.rejectionReason,
  createdAt: proof.createdAt,
  updatedAt: proof.updatedAt,
  history: mapPaymentProofHistory(proof.statusHistory),
});

const mapPaymentTermItem = (term: {
  id: string;
  bookingId: string;
  type: string;
  amount: number;
  status: string;
  dueDate: Date | null;
  sequence: number;
  paymentProofs: Array<{
    id: string;
    paymentTermId: string;
    amount: number;
    fileUrl: string;
    status: string;
    note: string | null;
    verificationNote: string | null;
    rejectionReason: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
}): UserBookingPaymentTermItemDTO => ({
  id: term.id,
  bookingId: term.bookingId,
  type: mapPaymentType(term.type),
  amount: term.amount,
  status: mapPaymentTermStatus(term.status),
  dueDate: term.dueDate,
  sequence: term.sequence,
  latestProof: term.paymentProofs[0]
    ? {
        id: term.paymentProofs[0].id,
        paymentTermId: term.paymentProofs[0].paymentTermId,
        amount: term.paymentProofs[0].amount,
        fileUrl: term.paymentProofs[0].fileUrl,
        status: mapPaymentProofStatus(term.paymentProofs[0].status),
        note: term.paymentProofs[0].note,
        verificationNote: term.paymentProofs[0].verificationNote,
        rejectionReason: term.paymentProofs[0].rejectionReason,
        createdAt: term.paymentProofs[0].createdAt,
        updatedAt: term.paymentProofs[0].updatedAt,
      }
    : null,
});

const mapBookingTimelineItem = (item: {
  id: string;
  previousStatus: string | null;
  newStatus: string;
  note: string | null;
  createdAt: Date;
  changedBy: {
    name: string | null;
  } | null;
}): UserBookingTimelineItemDTO => {
  const nextStatus = mapBookingStatus(item.newStatus);

  if (!item.previousStatus && nextStatus === "PENDING") {
    return {
      id: `booking-${item.id}`,
      type: "BOOKING_CREATED",
      title: "Booking dibuat",
      description: item.note ?? "Permintaan booking berhasil dibuat dan menunggu respons vendor.",
      actorName: item.changedBy?.name ?? null,
      createdAt: item.createdAt,
    };
  }

  if (nextStatus === "PENDING_PAYMENT") {
    return {
      id: `booking-${item.id}`,
      type: "BOOKING_ACCEPTED",
      title: "Vendor menerima booking",
      description: item.note ?? "Vendor menerima booking dan menunggu pembayaran Anda.",
      actorName: item.changedBy?.name ?? null,
      createdAt: item.createdAt,
    };
  }

  if (nextStatus === "REJECTED") {
    return {
      id: `booking-${item.id}`,
      type: "BOOKING_REJECTED",
      title: "Booking ditolak",
      description: item.note ?? "Vendor menolak booking ini.",
      actorName: item.changedBy?.name ?? null,
      createdAt: item.createdAt,
    };
  }

  if (nextStatus === "CONFIRMED") {
    return {
      id: `booking-${item.id}`,
      type: "BOOKING_CONFIRMED",
      title: "Booking dikonfirmasi",
      description: item.note ?? "Booking telah dikonfirmasi setelah pembayaran diverifikasi.",
      actorName: item.changedBy?.name ?? null,
      createdAt: item.createdAt,
    };
  }

  if (nextStatus === "COMPLETED") {
    return {
      id: `booking-${item.id}`,
      type: "BOOKING_COMPLETED",
      title: "Booking selesai",
      description: item.note ?? "Acara atau layanan telah selesai dilaksanakan.",
      actorName: item.changedBy?.name ?? null,
      createdAt: item.createdAt,
    };
  }

  if (nextStatus === "CANCELLED") {
    return {
      id: `booking-${item.id}`,
      type: "BOOKING_CANCELLED",
      title: "Booking dibatalkan",
      description: item.note ?? "Booking dibatalkan.",
      actorName: item.changedBy?.name ?? null,
      createdAt: item.createdAt,
    };
  }

  return {
    id: `booking-${item.id}`,
    type: `BOOKING_${nextStatus}`,
    title: `Status booking berubah ke ${nextStatus}`,
    description: item.note,
    actorName: item.changedBy?.name ?? null,
    createdAt: item.createdAt,
  };
};

const mapPaymentTimelineItem = (input: {
  proofId: string;
  paymentTermType: string;
  paymentTermSequence: number;
  history: {
    id: string;
    previousStatus: string | null;
    newStatus: string;
    note: string | null;
    createdAt: Date;
    changedBy: {
      name: string | null;
    } | null;
  };
}): UserBookingTimelineItemDTO => {
  const nextStatus = mapPaymentProofStatus(input.history.newStatus);
  const termLabel = `Termin ${input.paymentTermSequence} · ${input.paymentTermType}`;

  if (!input.history.previousStatus && nextStatus === "PENDING") {
    return {
      id: `payment-${input.history.id}`,
      type: "PAYMENT_PROOF_UPLOADED",
      title: "Bukti pembayaran diunggah",
      description: input.history.note ?? `${termLabel} berhasil diunggah dan menunggu verifikasi.`,
      actorName: input.history.changedBy?.name ?? null,
      createdAt: input.history.createdAt,
    };
  }

  if (input.history.previousStatus === "REJECTED" && nextStatus === "PENDING") {
    return {
      id: `payment-${input.history.id}`,
      type: "PAYMENT_PROOF_REUPLOADED",
      title: "Bukti pembayaran diunggah ulang",
      description: input.history.note ?? `${termLabel} diunggah ulang setelah sebelumnya ditolak.`,
      actorName: input.history.changedBy?.name ?? null,
      createdAt: input.history.createdAt,
    };
  }

  if (nextStatus === "VERIFIED") {
    return {
      id: `payment-${input.history.id}`,
      type: "PAYMENT_VERIFIED",
      title: "Pembayaran diverifikasi",
      description: input.history.note ?? `${termLabel} telah diverifikasi oleh vendor.`,
      actorName: input.history.changedBy?.name ?? null,
      createdAt: input.history.createdAt,
    };
  }

  if (nextStatus === "REJECTED") {
    return {
      id: `payment-${input.history.id}`,
      type: "PAYMENT_REJECTED",
      title: "Pembayaran ditolak",
      description: input.history.note ?? `${termLabel} ditolak dan perlu diunggah ulang.`,
      actorName: input.history.changedBy?.name ?? null,
      createdAt: input.history.createdAt,
    };
  }

  return {
    id: `payment-${input.history.id}`,
    type: `PAYMENT_${nextStatus}`,
    title: `Status pembayaran berubah ke ${nextStatus}`,
    description: input.history.note,
    actorName: input.history.changedBy?.name ?? null,
    createdAt: input.history.createdAt,
  };
};

const buildTimeline = (input: {
  bookingHistory: Array<{
    id: string;
    previousStatus: string | null;
    newStatus: string;
    note: string | null;
    createdAt: Date;
    changedBy: {
      name: string | null;
    } | null;
  }>;
  paymentProofs: Array<{
    id: string;
    paymentTerm: {
      type: string;
      sequence: number;
    };
    statusHistory: Array<{
      id: string;
      previousStatus: string | null;
      newStatus: string;
      note: string | null;
      createdAt: Date;
      changedBy: {
        name: string | null;
      } | null;
    }>;
  }>;
}): UserBookingTimelineItemDTO[] => {
  const bookingItems = input.bookingHistory.map((item) => mapBookingTimelineItem(item));
  const paymentItems = input.paymentProofs.flatMap((proof) =>
    proof.statusHistory.map((history) =>
      mapPaymentTimelineItem({
        proofId: proof.id,
        paymentTermType: proof.paymentTerm.type,
        paymentTermSequence: proof.paymentTerm.sequence,
        history,
      })
    )
  );

  return [...bookingItems, ...paymentItems].sort(
    (left, right) => left.createdAt.getTime() - right.createdAt.getTime()
  );
};

const mapBookingDetail = (
  booking:
    | {
        id: string;
        bookingCode: string;
        userId: string;
        vendorId: string;
        serviceId: string | null;
        bookedAt: Date;
        eventDate: Date;
        eventLocation: string;
        customerName: string;
        customerPhone: string;
        customerEmail: string;
        guestCount: number | null;
        status: string;
        notes: string | null;
        specialRequest: string | null;
        totalAmount: number;
        paymentStatus: string;
        createdAt: Date;
        updatedAt: Date;
        vendor: {
          id: string;
          businessName: string | null;
          city: string | null;
          province: string | null;
          contactInfo: string | null;
          phoneNumber: string | null;
          whatsappNumber: string | null;
          coverImageUrl: string | null;
          logoUrl: string | null;
          category: {
            name: string;
          } | null;
        };
        service: {
          id: string;
          vendorId: string;
          name: string;
          description: string | null;
          price: number;
          isActive: boolean;
        } | null;
        statusHistory: Array<{
          id: string;
          bookingId: string;
          previousStatus: string | null;
          newStatus: string;
          changedById: string | null;
          note: string | null;
          createdAt: Date;
          changedBy: {
            name: string | null;
          } | null;
        }>;
        paymentTerms: Array<{
          id: string;
          bookingId: string;
          type: string;
          amount: number;
          status: string;
          dueDate: Date | null;
          sequence: number;
          paymentProofs: Array<{
            id: string;
            paymentTermId: string;
            amount: number;
            fileUrl: string;
            status: string;
            note: string | null;
            verificationNote: string | null;
            rejectionReason: string | null;
            createdAt: Date;
            updatedAt: Date;
          }>;
        }>;
        paymentProofs: Array<{
          id: string;
          bookingId: string;
          paymentTermId: string;
          amount: number;
          fileUrl: string;
          status: string;
          note: string | null;
          verificationNote: string | null;
          rejectionReason: string | null;
          createdAt: Date;
          updatedAt: Date;
          paymentTerm: {
            type: string;
            sequence: number;
          };
          statusHistory: Array<{
            id: string;
            paymentProofId: string;
            previousStatus: string | null;
            newStatus: string;
            changedById: string | null;
            note: string | null;
            isOverride: boolean;
            createdAt: Date;
            changedBy: {
              name: string | null;
            } | null;
          }>;
        }>;
      }
    | null
): UserBookingDetailDTO | null => {
  if (!booking || !booking.vendor.businessName) {
    return null;
  }

  const paymentTerms = booking.paymentTerms.map((term) => mapPaymentTermItem(term));
  const paymentProofs = booking.paymentProofs.map((proof) => mapPaymentProofItem(proof));
  const { totalPaidAmount, remainingBalance } = calculateRemainingBalance(
    booking.totalAmount,
    booking.paymentTerms
  );

  return {
    id: booking.id,
    bookingCode: booking.bookingCode,
    userId: booking.userId,
    vendorId: booking.vendorId,
    serviceId: booking.serviceId,
    bookedAt: booking.bookedAt,
    eventDate: booking.eventDate,
    eventLocation: booking.eventLocation,
    status: mapBookingStatus(booking.status),
    paymentStatus: mapPaymentStatus(booking.paymentStatus),
    totalAmount: booking.totalAmount,
    totalPaidAmount,
    remainingBalance,
    customerName: booking.customerName,
    customerPhone: booking.customerPhone,
    customerEmail: booking.customerEmail,
    guestCount: booking.guestCount,
    notes: booking.notes,
    specialRequest: booking.specialRequest,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    vendor: {
      id: booking.vendor.id,
      businessName: booking.vendor.businessName,
      categoryName: booking.vendor.category?.name ?? null,
      city: booking.vendor.city,
      province: booking.vendor.province,
      contactInfo: booking.vendor.contactInfo,
      phoneNumber: booking.vendor.phoneNumber,
      whatsappNumber: booking.vendor.whatsappNumber,
      coverImageUrl: booking.vendor.coverImageUrl,
      logoUrl: booking.vendor.logoUrl,
    },
    service: booking.service
      ? {
          id: booking.service.id,
          vendorId: booking.service.vendorId,
          name: booking.service.name,
          description: booking.service.description,
          price: booking.service.price,
          isActive: booking.service.isActive,
        }
      : null,
    history: mapBookingHistory(booking.statusHistory),
    paymentTerms,
    paymentProofs,
    timeline: buildTimeline({
      bookingHistory: booking.statusHistory,
      paymentProofs: booking.paymentProofs,
    }),
  };
};

const mapBookingListItem = (booking: {
  id: string;
  bookingCode: string;
  eventDate: Date;
  eventLocation: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  customerName: string;
  createdAt: Date;
  vendor: {
    id: string;
    businessName: string | null;
    city: string | null;
    province: string | null;
    coverImageUrl: string | null;
    logoUrl: string | null;
  };
  service: {
    id: string;
    name: string;
    price: number;
  } | null;
  paymentTerms: Array<{
    amount: number;
    status: string;
  }>;
}): UserBookingListItemDTO | null => {
  if (!booking.vendor.businessName) {
    return null;
  }

  const { remainingBalance } = calculateRemainingBalance(booking.totalAmount, booking.paymentTerms);

  return {
    id: booking.id,
    bookingCode: booking.bookingCode,
    eventDate: booking.eventDate,
    eventLocation: booking.eventLocation,
    status: mapBookingStatus(booking.status),
    paymentStatus: mapPaymentStatus(booking.paymentStatus),
    totalAmount: booking.totalAmount,
    remainingBalance,
    customerName: booking.customerName,
    createdAt: booking.createdAt,
    vendor: {
      id: booking.vendor.id,
      businessName: booking.vendor.businessName,
      city: booking.vendor.city,
      province: booking.vendor.province,
      coverImageUrl: booking.vendor.coverImageUrl,
      logoUrl: booking.vendor.logoUrl,
    },
    service: booking.service
      ? {
          id: booking.service.id,
          name: booking.service.name,
          price: booking.service.price,
        }
      : null,
  };
};

const bookingDetailInclude = {
  vendor: {
    select: {
      id: true,
      businessName: true,
      city: true,
      province: true,
      contactInfo: true,
      phoneNumber: true,
      whatsappNumber: true,
      coverImageUrl: true,
      logoUrl: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  },
  service: {
    select: {
      id: true,
      vendorId: true,
      name: true,
      description: true,
      price: true,
      isActive: true,
    },
  },
  statusHistory: {
    orderBy: {
      createdAt: "asc" as const,
    },
    include: {
      changedBy: {
        select: {
          name: true,
        },
      },
    },
  },
  paymentTerms: {
    orderBy: {
      sequence: "asc" as const,
    },
    include: {
      paymentProofs: {
        orderBy: {
          createdAt: "desc" as const,
        },
        take: 1,
        select: {
          id: true,
          paymentTermId: true,
          amount: true,
          fileUrl: true,
          status: true,
          note: true,
          verificationNote: true,
          rejectionReason: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  },
  paymentProofs: {
    orderBy: {
      createdAt: "desc" as const,
    },
    include: {
      paymentTerm: {
        select: {
          type: true,
          sequence: true,
        },
      },
      statusHistory: {
        orderBy: {
          createdAt: "asc" as const,
        },
        include: {
          changedBy: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  },
};

export class PrismaBookingRepository implements BookingRepository {
  async getBookingTarget(vendorId: string, serviceId: string): Promise<BookingTargetSnapshotDTO> {
    const [vendor, service] = await Promise.all([
      prisma.vendor.findUnique({
        where: { id: vendorId },
        select: {
          id: true,
          businessName: true,
          status: true,
          deletedAt: true,
          suspendedAt: true,
          city: true,
          province: true,
          coverImageUrl: true,
          logoUrl: true,
        },
      }),
      prisma.service.findUnique({
        where: { id: serviceId },
        select: {
          id: true,
          vendorId: true,
          name: true,
          description: true,
          price: true,
          isActive: true,
        },
      }),
    ]);

    return {
      vendor: vendor?.businessName
        ? {
            id: vendor.id,
            businessName: vendor.businessName,
            status: vendor.status,
            deletedAt: vendor.deletedAt,
            suspendedAt: vendor.suspendedAt,
            city: vendor.city,
            province: vendor.province,
            coverImageUrl: vendor.coverImageUrl,
            logoUrl: vendor.logoUrl,
          }
        : null,
      service,
    };
  }

  async hasActiveDuplicateBooking(input: {
    userId: string;
    vendorId: string;
    serviceId: string;
    eventDate: Date;
    excludeBookingId?: string;
  }): Promise<boolean> {
    const count = await prisma.booking.count({
      where: {
        userId: input.userId,
        vendorId: input.vendorId,
        serviceId: input.serviceId,
        eventDate: input.eventDate,
        status: {
          in: [...ACTIVE_DUPLICATE_STATUSES],
        },
        ...(input.excludeBookingId
          ? {
              id: {
                not: input.excludeBookingId,
              },
            }
          : {}),
      },
    });

    return count > 0;
  }

  async findDetailByIdForUser(id: string, userId: string): Promise<UserBookingDetailDTO | null> {
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId,
      },
      include: bookingDetailInclude,
    });

    return mapBookingDetail(booking);
  }

  async listByUser(
    userId: string,
    query: UserBookingListQuery,
    options?: ListOptions
  ): Promise<PaginatedResult<UserBookingListItemDTO>> {
    const limit = options?.take ?? query.limit;
    const page = Math.max(query.page, 1);
    const skip = options?.skip ?? (page - 1) * limit;

    const where = {
      AND: [
        { userId },
        query.search
          ? {
              OR: [
                { bookingCode: { contains: query.search, mode: "insensitive" as const } },
                {
                  vendor: {
                    businessName: { contains: query.search, mode: "insensitive" as const },
                  },
                },
                {
                  service: {
                    name: { contains: query.search, mode: "insensitive" as const },
                  },
                },
              ],
            }
          : {},
        query.bookingStatus ? { status: query.bookingStatus } : {},
        query.paymentStatus ? { paymentStatus: query.paymentStatus } : {},
        query.eventDateFrom || query.eventDateTo
          ? {
              eventDate: {
                ...(query.eventDateFrom ? { gte: query.eventDateFrom } : {}),
                ...(query.eventDateTo ? { lte: query.eventDateTo } : {}),
              },
            }
          : {},
      ],
    };

    const orderBy =
      query.sort === "oldest"
        ? [{ createdAt: "asc" as const }]
        : query.sort === "event-date-nearest"
          ? [{ eventDate: "asc" as const }, { createdAt: "desc" as const }]
          : [{ createdAt: "desc" as const }];

    const [bookings, totalItems] = await prisma.$transaction([
      prisma.booking.findMany({
        where,
        take: limit,
        skip,
        orderBy,
        include: {
          vendor: {
            select: {
              id: true,
              businessName: true,
              city: true,
              province: true,
              coverImageUrl: true,
              logoUrl: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
          paymentTerms: {
            select: {
              amount: true,
              status: true,
            },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    const items = bookings
      .map((booking) => mapBookingListItem(booking))
      .filter((booking): booking is UserBookingListItemDTO => Boolean(booking));

    return {
      items,
      page,
      pageSize: limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    };
  }

  async findTimelineByBookingIdForUser(
    bookingId: string,
    userId: string
  ): Promise<UserBookingTimelineItemDTO[] | null> {
    const booking = await this.findDetailByIdForUser(bookingId, userId);
    return booking?.timeline ?? null;
  }

  async create(
    input: CreateUserBookingRecordInput,
    auditLog: BookingAuditLogInput
  ): Promise<UserBookingDetailDTO> {
    let lastError: unknown;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        const bookingId = randomUUID();
        const bookingCode = await getNextBookingCode(prisma, new Date());

        await prisma.$transaction([
          prisma.booking.create({
            data: {
              id: bookingId,
              bookingCode,
              userId: input.userId,
              vendorId: input.vendorId,
              serviceId: input.serviceId,
              bookedAt: input.eventDate,
              eventDate: input.eventDate,
              eventLocation: input.eventLocation,
              customerName: input.customerName,
              customerPhone: input.customerPhone,
              customerEmail: input.customerEmail,
              guestCount: input.guestCount,
              status: "PENDING",
              notes: input.notes,
              specialRequest: input.specialRequest,
              totalAmount: input.totalAmount,
              paymentStatus: "UNPAID",
            },
          }),
          prisma.paymentTerm.createMany({
            data: input.paymentTerms.map((term) => ({
              bookingId,
              type: term.type,
              amount: term.amount,
              status: term.status,
              dueDate: term.dueDate ?? null,
              sequence: term.sequence,
            })),
          }),
          prisma.bookingStatusHistory.create({
            data: {
              bookingId,
              previousStatus: null,
              newStatus: "PENDING",
              changedById: input.userId,
              note: "Booking created by user",
            },
          }),
          prisma.auditLog.create({
            data: {
              actorId: auditLog.actorId,
              module: auditLog.module ?? AuditModule.USER_BOOKINGS,
              action: auditLog.action ?? BOOKING_CREATED_AUDIT_ACTION,
              targetId: bookingId,
              beforeData: toJsonValue(auditLog.beforeData),
              afterData: toJsonValue(
                auditLog.afterData ?? {
                  bookingCode,
                  status: "PENDING",
                  paymentStatus: "UNPAID",
                  totalAmount: input.totalAmount,
                  eventDate: input.eventDate,
                }
              ),
              ipAddress: auditLog.ipAddress,
              userAgent: auditLog.userAgent,
            },
          }),
        ]);

        const booking = await prisma.booking.findUnique({
          where: {
            id: bookingId,
          },
          include: bookingDetailInclude,
        });

        const mapped = mapBookingDetail(booking);
        if (!mapped) {
          throw new Error("Booking berhasil dibuat tetapi detail booking gagal dimuat");
        }

        return mapped;
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === "P2002"
        ) {
          lastError = error;
          continue;
        }

        throw error;
      }
    }

    throw lastError ?? new Error("Gagal membuat kode booking yang unik");
  }
}
