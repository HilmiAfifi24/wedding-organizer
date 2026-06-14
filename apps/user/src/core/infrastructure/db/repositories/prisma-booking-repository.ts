import "server-only";
import { randomUUID } from "node:crypto";

import type {
  BookingStatus,
  ListOptions,
  PaymentStatus,
} from "@wo/shared-types";
import { AuditModule } from "@wo/shared-types";

import type {
  BookingAuditLogInput,
  BookingRepository,
  BookingTargetSnapshotDTO,
  CreateUserBookingRecordInput,
  UserBookingDetailDTO,
  UserBookingListItemDTO,
} from "../../../domain/repositories";
import { prisma } from "../prisma";

const ACTIVE_DUPLICATE_STATUSES = ["PENDING", "PENDING_PAYMENT", "CONFIRMED"] as const;
const BOOKING_CREATED_AUDIT_ACTION = "BOOKING_CREATED";
type BookingCodeClient = Pick<typeof prisma, "booking">;

const mapBookingStatus = (status: string) => status as BookingStatus;
const mapPaymentStatus = (status: string) => status as PaymentStatus;

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
          coverImageUrl: string | null;
          logoUrl: string | null;
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
      }
    | null
): UserBookingDetailDTO | null => {
  if (!booking || !booking.vendor.businessName) {
    return null;
  }

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
      city: booking.vendor.city,
      province: booking.vendor.province,
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
}): UserBookingListItemDTO | null => {
  if (!booking.vendor.businessName) {
    return null;
  }

  return {
    id: booking.id,
    bookingCode: booking.bookingCode,
    eventDate: booking.eventDate,
    eventLocation: booking.eventLocation,
    status: mapBookingStatus(booking.status),
    paymentStatus: mapPaymentStatus(booking.paymentStatus),
    totalAmount: booking.totalAmount,
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
            vendorId: true,
            name: true,
            description: true,
            price: true,
            isActive: true,
          },
        },
        statusHistory: {
          orderBy: {
            createdAt: "asc",
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
    });

    return mapBookingDetail(booking);
  }

  async listByUser(userId: string, options?: ListOptions): Promise<UserBookingListItemDTO[]> {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      take: options?.take,
      skip: options?.skip,
      orderBy: { createdAt: "desc" },
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
      },
    });

    return bookings
      .map((booking) => mapBookingListItem(booking))
      .filter((booking): booking is UserBookingListItemDTO => Boolean(booking));
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
                vendorId: true,
                name: true,
                description: true,
                price: true,
                isActive: true,
              },
            },
            statusHistory: {
              orderBy: {
                createdAt: "asc",
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
