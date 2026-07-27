import "server-only";

import type {
  AdminBookingDetailDTO,
  AdminBookingListItemDTO,
  BookingStatus,
  BookingStatusHistoryDTO,
  PaymentProofDTO,
  PaymentProofStatus,
  Role,
} from "@wo/shared-types";

import { mapPrismaVendorStatusToDto } from "@/core/domain/entities/vendor-account";
import type {
  VendorBookingListQuery,
  VendorBookingManagementRepository,
} from "@/core/domain/repositories/vendor-booking-management-repository";

import { prisma } from "../prisma";

type PrismaBookingListRecord = {
  id: string;
  bookedAt: Date;
  status: string;
  notes: string | null;
  specialRequest: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  vendorId: string;
  serviceId: string | null;
  user: {
    name: string | null;
    email: string;
  };
  vendor: {
    name: string;
    status: string;
  };
  service: {
    name: string;
  } | null;
  paymentProofs: Array<{
    id: string;
  }>;
};

const mapBookingStatus = (status: string) => status as BookingStatus;
const mapPaymentStatus = (status: string) => status as PaymentProofStatus;

const mapPaymentProof = (
  paymentProof:
    | {
        id: string;
        bookingId: string;
        fileUrl: string;
        note: string | null;
        status: string;
        verifiedById: string | null;
        verifiedAt: Date | null;
        rejectedById: string | null;
        rejectedAt: Date | null;
        rejectionReason: string | null;
        verificationNote: string | null;
        overriddenById: string | null;
        overriddenAt: Date | null;
        overrideReason: string | null;
        createdAt: Date;
        updatedAt: Date;
      }
    | null
    | undefined
): PaymentProofDTO | null => {
  if (!paymentProof) {
    return null;
  }

  return {
    id: paymentProof.id,
    bookingId: paymentProof.bookingId,
    fileUrl: paymentProof.fileUrl,
    note: paymentProof.note,
    status: mapPaymentStatus(paymentProof.status),
    verifiedById: paymentProof.verifiedById,
    verifiedAt: paymentProof.verifiedAt,
    rejectedById: paymentProof.rejectedById,
    rejectedAt: paymentProof.rejectedAt,
    rejectionReason: paymentProof.rejectionReason,
    verificationNote: paymentProof.verificationNote,
    overriddenById: paymentProof.overriddenById,
    overriddenAt: paymentProof.overriddenAt,
    overrideReason: paymentProof.overrideReason,
    createdAt: paymentProof.createdAt,
    updatedAt: paymentProof.updatedAt,
  };
};

const mapBookingListItem = (booking: PrismaBookingListRecord): AdminBookingListItemDTO => ({
  id: booking.id,
  bookedAt: booking.bookedAt,
  status: mapBookingStatus(booking.status),
  notes: booking.notes,
  specialRequest: booking.specialRequest,
  createdAt: booking.createdAt,
  updatedAt: booking.updatedAt,
  userId: booking.userId,
  userName: booking.user.name,
  userEmail: booking.user.email,
  vendorId: booking.vendorId,
  vendorName: booking.vendor.name,
  vendorStatus: mapPrismaVendorStatusToDto(booking.vendor.status),
  serviceId: booking.serviceId,
  serviceName: booking.service?.name ?? null,
  hasPaymentProof: booking.paymentProofs.length > 0,
});

export class PrismaVendorBookingManagementRepository implements VendorBookingManagementRepository {
  async listBookings(vendorId: string, query: VendorBookingListQuery) {
    const skip = (query.page - 1) * query.pageSize;

    const where = {
      AND: [
        { vendorId },
        query.search
          ? {
              OR: [
                { id: { contains: query.search, mode: "insensitive" as const } },
                { notes: { contains: query.search, mode: "insensitive" as const } },
                { user: { name: { contains: query.search, mode: "insensitive" as const } } },
                { user: { email: { contains: query.search, mode: "insensitive" as const } } },
                { service: { name: { contains: query.search, mode: "insensitive" as const } } },
              ],
            }
          : {},
        query.status ? { status: query.status } : {},
        query.customer
          ? {
              OR: [
                { user: { name: { contains: query.customer, mode: "insensitive" as const } } },
                { user: { email: { contains: query.customer, mode: "insensitive" as const } } },
              ],
            }
          : {},
        query.service
          ? {
              service: {
                name: {
                  contains: query.service,
                  mode: "insensitive" as const,
                },
              },
            }
          : {},
        query.bookedFrom || query.bookedTo
          ? {
              bookedAt: {
                ...(query.bookedFrom ? { gte: query.bookedFrom } : {}),
                ...(query.bookedTo ? { lte: query.bookedTo } : {}),
              },
            }
          : {},
      ],
    };

    const orderBy = { [query.sortBy]: query.sortDirection } as Record<string, "asc" | "desc">;

    const [bookings, totalItems] = await prisma.$transaction([
      prisma.booking.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          vendor: {
            select: {
              name: true,
              status: true,
            },
          },
          service: {
            select: {
              name: true,
            },
          },
          paymentProofs: {
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
            select: {
              id: true,
            },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      items: bookings.map((booking) =>
        mapBookingListItem({
          ...booking,
          status: booking.status,
        })
      ),
      totalItems,
    };
  }

  async getBookingById(vendorId: string, bookingId: string): Promise<AdminBookingDetailDTO | null> {
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        vendorId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            suspendedAt: true,
            deletedAt: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
            status: true,
            suspendedAt: true,
            deletedAt: true,
            owner: {
              select: {
                name: true,
                email: true,
              },
            },
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
            name: true,
            description: true,
            price: true,
            isActive: true,
          },
        },
        paymentProofs: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            bookingId: true,
            fileUrl: true,
            note: true,
            status: true,
            verifiedById: true,
            verifiedAt: true,
            rejectedById: true,
            rejectedAt: true,
            rejectionReason: true,
            verificationNote: true,
            overriddenById: true,
            overriddenAt: true,
            overrideReason: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!booking) {
      return null;
    }

    return {
      ...mapBookingListItem({
        id: booking.id,
        bookedAt: booking.bookedAt,
        status: booking.status,
        notes: booking.notes,
        specialRequest: booking.specialRequest,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        userId: booking.userId,
        vendorId: booking.vendorId,
        serviceId: booking.serviceId,
        user: {
          name: booking.user.name,
          email: booking.user.email,
        },
        vendor: {
          name: booking.vendor.name,
          status: booking.vendor.status,
        },
        service: booking.service
          ? {
              name: booking.service.name,
            }
          : null,
        paymentProofs: booking.paymentProofs[0]
          ? [
              {
                id: booking.paymentProofs[0].id,
              },
            ]
          : [],
      }),
      user: {
        id: booking.user.id,
        name: booking.user.name,
        email: booking.user.email,
        role: booking.user.role as Role,
        suspendedAt: booking.user.suspendedAt,
        deletedAt: booking.user.deletedAt,
      },
      vendor: {
        id: booking.vendor.id,
        name: booking.vendor.name,
        status: mapPrismaVendorStatusToDto(booking.vendor.status),
        categoryName: booking.vendor.category?.name ?? null,
        ownerName: booking.vendor.owner.name,
        ownerEmail: booking.vendor.owner.email,
        deletedAt: booking.vendor.deletedAt,
        suspendedAt: booking.vendor.suspendedAt,
      },
      service: booking.service
        ? {
            id: booking.service.id,
            name: booking.service.name,
            description: booking.service.description,
            price: booking.service.price,
            isActive: booking.service.isActive,
          }
        : null,
      paymentProof: mapPaymentProof(booking.paymentProofs[0]),
    };
  }

  async getBookingHistory(vendorId: string, bookingId: string): Promise<BookingStatusHistoryDTO[]> {
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        vendorId,
      },
      select: {
        id: true,
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    const items = await prisma.bookingStatusHistory.findMany({
      where: { bookingId },
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
    });

    return items.map((item) => ({
      id: item.id,
      bookingId: item.bookingId,
      previousStatus: item.previousStatus ? mapBookingStatus(item.previousStatus) : null,
      newStatus: mapBookingStatus(item.newStatus),
      changedById: item.changedById,
      changedByName: item.changedBy?.name ?? null,
      note: item.note,
      createdAt: item.createdAt,
    }));
  }

  async transitionBookingStatus(input: {
    vendorId: string;
    bookingId: string;
    nextStatus: BookingStatus;
    actorId: string;
    note?: string;
  }): Promise<AdminBookingDetailDTO> {
    await prisma.$transaction(async (tx) => {
      const current = await tx.booking.findFirst({
        where: {
          id: input.bookingId,
          vendorId: input.vendorId,
        },
        select: {
          status: true,
          paymentProofs: {
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      if (!current) {
        throw new Error("Booking not found");
      }

      if (input.nextStatus === "CONFIRMED") {
        const latestPaymentProof = current.paymentProofs[0];

        if (!latestPaymentProof) {
          throw new Error("Payment proof is required before confirming booking");
        }

        if (latestPaymentProof.status !== "VERIFIED") {
          await tx.paymentProof.update({
            where: { id: latestPaymentProof.id },
            data: {
              status: "VERIFIED",
              verifiedById: input.actorId,
              verifiedAt: new Date(),
              verificationNote: input.note?.trim() || "Payment verified by vendor",
              rejectedById: null,
              rejectedAt: null,
              rejectionReason: null,
            },
          });

          await tx.paymentProofStatusHistory.create({
            data: {
              paymentProofId: latestPaymentProof.id,
              previousStatus: latestPaymentProof.status,
              newStatus: "VERIFIED",
              changedById: input.actorId,
              note: input.note?.trim() || "Payment verified by vendor",
              isOverride: false,
            },
          });
        }
      }

      await tx.booking.update({
        where: { id: input.bookingId },
        data: {
          status: input.nextStatus,
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: input.bookingId,
          previousStatus: current.status,
          newStatus: input.nextStatus,
          changedById: input.actorId,
          note: input.note?.trim() || null,
        },
      });
    });

    const updated = await this.getBookingById(input.vendorId, input.bookingId);
    if (!updated) {
      throw new Error("Booking not found");
    }

    return updated;
  }
}
