import "server-only";

import type {
  AdminBookingDetailDTO,
  AdminBookingListItemDTO,
  AdminBookingsQuery,
  AuditModule,
  AuditLogDTO,
  BookingStatus,
  BookingStatusHistoryDTO,
  CreateAuditLogInput,
  PaymentProofDTO,
  PaymentProofStatus,
  Role,
} from "@wo/shared-types";

import {
  mapPrismaVendorStatusToDto,
  type BookingPermissionFlags,
} from "@/core/domain/entities/booking-management";
import type { BookingManagementRepository } from "@/core/domain/repositories";

import { prisma } from "../prisma";

type PrismaBookingListRecord = {
  id: string;
  bookedAt: Date;
  status: string;
  notes: string | null;
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
  paymentProof: {
    id: string;
  } | null;
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
  hasPaymentProof: Boolean(booking.paymentProof),
});

const toJsonValue = (value: unknown) => {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value));
};

export class PrismaBookingManagementRepository implements BookingManagementRepository {
  async getActorPermissionByMenuCode(
    actorId: string,
    menuCode: string
  ): Promise<BookingPermissionFlags | null> {
    const user = await prisma.user.findUnique({
      where: { id: actorId },
      select: {
        accessProfile: {
          select: {
            permissions: {
              where: {
                accessMenu: {
                  code: menuCode,
                },
              },
              select: {
                canView: true,
                canInsert: true,
                canUpdate: true,
                canUpsert: true,
                canDelete: true,
                canHistory: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    const permission = user?.accessProfile?.permissions?.[0];
    if (!permission) {
      return null;
    }

    return {
      canView: permission.canView,
      canInsert: permission.canInsert,
      canUpdate: permission.canUpdate,
      canUpsert: permission.canUpsert,
      canDelete: permission.canDelete,
      canHistory: permission.canHistory,
    };
  }

  async listBookings(
    query: Required<
      Pick<AdminBookingsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">
    > &
      Omit<AdminBookingsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">
  ): Promise<{ items: AdminBookingListItemDTO[]; totalItems: number }> {
    const skip = (query.page - 1) * query.pageSize;

    const where = {
      AND: [
        query.search
          ? {
              OR: [
                { id: { contains: query.search, mode: "insensitive" as const } },
                { notes: { contains: query.search, mode: "insensitive" as const } },
                { user: { name: { contains: query.search, mode: "insensitive" as const } } },
                { user: { email: { contains: query.search, mode: "insensitive" as const } } },
                { vendor: { name: { contains: query.search, mode: "insensitive" as const } } },
                { service: { name: { contains: query.search, mode: "insensitive" as const } } },
              ],
            }
          : {},
        query.status ? { status: query.status } : {},
        query.vendor
          ? { vendor: { name: { contains: query.vendor, mode: "insensitive" as const } } }
          : {},
        query.user
          ? {
              OR: [
                { user: { name: { contains: query.user, mode: "insensitive" as const } } },
                { user: { email: { contains: query.user, mode: "insensitive" as const } } },
              ],
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
          paymentProof: {
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

  async getBookingById(bookingId: string): Promise<AdminBookingDetailDTO | null> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
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
        paymentProof: {
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
        paymentProof: booking.paymentProof
          ? {
              id: booking.paymentProof.id,
            }
          : null,
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
      paymentProof: mapPaymentProof(booking.paymentProof),
    };
  }

  async getBookingHistory(bookingId: string): Promise<BookingStatusHistoryDTO[]> {
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
    bookingId: string;
    nextStatus: BookingStatus;
    actorId: string;
    note?: string;
  }): Promise<AdminBookingDetailDTO> {
    await prisma.$transaction(async (tx) => {
      const current = await tx.booking.findUnique({
        where: { id: input.bookingId },
        select: {
          status: true,
        },
      });

      if (!current) {
        throw new Error("Booking not found");
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

    const updated = await this.getBookingById(input.bookingId);
    if (!updated) {
      throw new Error("Booking not found");
    }

    return updated;
  }

  async createAuditLog(data: CreateAuditLogInput): Promise<AuditLogDTO> {
    const auditLog = await prisma.auditLog.create({
      data: {
        actorId: data.actorId,
        module: data.module,
        action: data.action,
        targetId: data.targetId,
        beforeData: toJsonValue(data.beforeData),
        afterData: toJsonValue(data.afterData),
      },
    });

    return {
      id: auditLog.id,
      actorId: auditLog.actorId,
      module: auditLog.module as AuditModule,
      action: auditLog.action,
      targetId: auditLog.targetId,
      beforeData: auditLog.beforeData,
      afterData: auditLog.afterData,
      createdAt: auditLog.createdAt,
    };
  }
}
