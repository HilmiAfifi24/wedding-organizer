import "server-only";

import type {
  AuditLogDTO,
  AuditModule,
  BookingStatus,
  CreateAuditLogInput,
  PaymentProofStatus,
  PaymentProofStatusHistoryDTO,
} from "@wo/shared-types";

import type {
  ParsedVendorPaymentListQuery,
  VendorPaymentDetailDTO,
  VendorPaymentListItemDTO,
} from "@/core/application/dto/payments/vendor-payment-management-dto";
import { mapPrismaVendorStatusToDto } from "@/core/domain/entities/vendor-account";
import type { VendorPaymentManagementRepository } from "@/core/domain/repositories/vendor-payment-management-repository";

import { prisma } from "../prisma";

type PrismaPaymentProofListRecord = {
  id: string;
  bookingId: string;
  fileUrl: string;
  note: string | null;
  status: string;
  verifiedAt: Date | null;
  rejectedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  booking: {
    id: string;
    bookedAt: Date;
    status: string;
    userId: string;
    vendorId: string;
    user: {
      name: string | null;
      email: string;
    };
    service: {
      name: string;
      price: number;
    } | null;
  };
};

const sensitiveKeyPattern =
  /password|passwordhash|token|secret|authorization|cookie|session|refresh|access|apikey|api_key/i;

const sanitizeAuditValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeAuditValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, currentValue]) => [
        key,
        sensitiveKeyPattern.test(key) ? "[REDACTED]" : sanitizeAuditValue(currentValue),
      ])
    );
  }

  return value;
};

const toJsonValue = (value: unknown) => {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(sanitizeAuditValue(value)));
};

const mapBookingStatus = (status: string) => status as BookingStatus;
const mapPaymentStatus = (status: string) => status as PaymentProofStatus;

const mapPaymentProofListItem = (
  paymentProof: PrismaPaymentProofListRecord
): VendorPaymentListItemDTO => ({
  id: paymentProof.id,
  bookingId: paymentProof.bookingId,
  bookingDate: paymentProof.booking.bookedAt,
  bookingStatus: mapBookingStatus(paymentProof.booking.status),
  paymentProofStatus: mapPaymentStatus(paymentProof.status),
  fileUrl: paymentProof.fileUrl,
  uploadedAt: paymentProof.createdAt,
  updatedAt: paymentProof.updatedAt,
  customerId: paymentProof.booking.userId,
  customerName: paymentProof.booking.user.name,
  customerEmail: paymentProof.booking.user.email,
  customerPhone: null,
  serviceName: paymentProof.booking.service?.name ?? null,
  totalAmount: paymentProof.booking.service?.price ?? null,
  verifiedAt: paymentProof.verifiedAt,
  rejectedAt: paymentProof.rejectedAt,
});

export class PrismaVendorPaymentManagementRepository implements VendorPaymentManagementRepository {
  async listPaymentProofs(vendorId: string, query: ParsedVendorPaymentListQuery) {
    const skip = (query.page - 1) * query.pageSize;

    const where = {
      AND: [
        {
          booking: {
            vendorId,
          },
        },
        query.search
          ? {
              OR: [
                { bookingId: { contains: query.search, mode: "insensitive" as const } },
                {
                  booking: {
                    user: {
                      name: { contains: query.search, mode: "insensitive" as const },
                    },
                  },
                },
              ],
            }
          : {},
        query.paymentProofStatus ? { status: query.paymentProofStatus } : {},
        query.customer
          ? {
              OR: [
                {
                  booking: {
                    user: {
                      name: { contains: query.customer, mode: "insensitive" as const },
                    },
                  },
                },
                {
                  booking: {
                    user: {
                      email: { contains: query.customer, mode: "insensitive" as const },
                    },
                  },
                },
              ],
            }
          : {},
        query.bookedFrom || query.bookedTo
          ? {
              booking: {
                bookedAt: {
                  ...(query.bookedFrom ? { gte: query.bookedFrom } : {}),
                  ...(query.bookedTo ? { lte: query.bookedTo } : {}),
                },
              },
            }
          : {},
        query.uploadedFrom || query.uploadedTo
          ? {
              createdAt: {
                ...(query.uploadedFrom ? { gte: query.uploadedFrom } : {}),
                ...(query.uploadedTo ? { lte: query.uploadedTo } : {}),
              },
            }
          : {},
      ],
    };

    const orderBy =
      query.sortBy === "bookedAt"
        ? ({ booking: { bookedAt: query.sortDirection } } as const)
        : query.sortBy === "status"
          ? ({ status: query.sortDirection } as const)
          : ({ [query.sortBy]: query.sortDirection } as Record<string, "asc" | "desc">);

    const [items, totalItems] = await prisma.$transaction([
      prisma.paymentProof.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy,
        include: {
          booking: {
            select: {
              id: true,
              bookedAt: true,
              status: true,
              userId: true,
              vendorId: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
              service: {
                select: {
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
      }),
      prisma.paymentProof.count({ where }),
    ]);

    return {
      items: items.map((item) =>
        mapPaymentProofListItem({
          ...item,
          status: item.status,
        })
      ),
      totalItems,
    };
  }

  async getPaymentProofById(
    vendorId: string,
    paymentProofId: string
  ): Promise<VendorPaymentDetailDTO | null> {
    const paymentProof = await prisma.paymentProof.findFirst({
      where: {
        id: paymentProofId,
        booking: {
          vendorId,
        },
      },
      include: {
        booking: {
          select: {
            id: true,
            bookedAt: true,
            status: true,
            notes: true,
            serviceId: true,
            vendorId: true,
            userId: true,
            service: {
              select: {
                name: true,
                price: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            vendor: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
        verifiedBy: {
          select: {
            name: true,
          },
        },
        rejectedBy: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!paymentProof) {
      return null;
    }

    return {
      ...mapPaymentProofListItem({
        id: paymentProof.id,
        bookingId: paymentProof.bookingId,
        fileUrl: paymentProof.fileUrl,
        note: paymentProof.note,
        status: paymentProof.status,
        verifiedAt: paymentProof.verifiedAt,
        rejectedAt: paymentProof.rejectedAt,
        createdAt: paymentProof.createdAt,
        updatedAt: paymentProof.updatedAt,
        booking: {
          id: paymentProof.booking.id,
          bookedAt: paymentProof.booking.bookedAt,
          status: paymentProof.booking.status,
          userId: paymentProof.booking.userId,
          vendorId: paymentProof.booking.vendorId,
          user: {
            name: paymentProof.booking.user.name,
            email: paymentProof.booking.user.email,
          },
          service: paymentProof.booking.service
            ? {
                name: paymentProof.booking.service.name,
                price: paymentProof.booking.service.price,
              }
            : null,
        },
      }),
      note: paymentProof.note,
      verificationNote: paymentProof.verificationNote,
      rejectionReason: paymentProof.rejectionReason,
      verifiedById: paymentProof.verifiedById,
      verifiedByName: paymentProof.verifiedBy?.name ?? null,
      rejectedById: paymentProof.rejectedById,
      rejectedByName: paymentProof.rejectedBy?.name ?? null,
      booking: {
        id: paymentProof.booking.id,
        bookedAt: paymentProof.booking.bookedAt,
        status: mapBookingStatus(paymentProof.booking.status),
        notes: paymentProof.booking.notes,
        serviceId: paymentProof.booking.serviceId,
        serviceName: paymentProof.booking.service?.name ?? null,
        packageName: null,
        totalAmount: paymentProof.booking.service?.price ?? null,
      },
      user: {
        id: paymentProof.booking.user.id,
        name: paymentProof.booking.user.name,
        email: paymentProof.booking.user.email,
        phone: null,
      },
      vendor: {
        id: paymentProof.booking.vendor.id,
        name: paymentProof.booking.vendor.name,
        status: mapPrismaVendorStatusToDto(paymentProof.booking.vendor.status),
      },
    };
  }

  async getPaymentProofHistory(
    vendorId: string,
    paymentProofId: string
  ): Promise<PaymentProofStatusHistoryDTO[]> {
    const paymentProof = await prisma.paymentProof.findFirst({
      where: {
        id: paymentProofId,
        booking: {
          vendorId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!paymentProof) {
      throw new Error("Payment proof not found");
    }

    const items = await prisma.paymentProofStatusHistory.findMany({
      where: { paymentProofId },
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
      paymentProofId: item.paymentProofId,
      previousStatus: item.previousStatus ? mapPaymentStatus(item.previousStatus) : null,
      newStatus: mapPaymentStatus(item.newStatus),
      changedById: item.changedById,
      changedByName: item.changedBy?.name ?? null,
      note: item.note,
      isOverride: item.isOverride,
      createdAt: item.createdAt,
    }));
  }

  async verifyPaymentProof(input: {
    vendorId: string;
    paymentProofId: string;
    actorId: string;
    verificationNote?: string;
  }) {
    const current = await prisma.paymentProof.findFirst({
      where: {
        id: input.paymentProofId,
        booking: {
          vendorId: input.vendorId,
        },
      },
      select: {
        status: true,
        booking: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!current) {
      throw new Error("Payment proof not found");
    }

    const previousPaymentStatus = mapPaymentStatus(current.status);
    const previousBookingStatus = mapBookingStatus(current.booking.status);
    const verificationNote = input.verificationNote?.trim() || "Pembayaran diverifikasi vendor";

    await prisma.$transaction(async (tx) => {
      const now = new Date();

      await tx.paymentProof.update({
        where: { id: input.paymentProofId },
        data: {
          status: "VERIFIED",
          verifiedById: input.actorId,
          verifiedAt: now,
          verificationNote,
          rejectedById: null,
          rejectedAt: null,
          rejectionReason: null,
        },
      });

      await tx.paymentProofStatusHistory.create({
        data: {
          paymentProofId: input.paymentProofId,
          previousStatus: current.status,
          newStatus: "VERIFIED",
          changedById: input.actorId,
          note: verificationNote,
          isOverride: false,
        },
      });

      await tx.booking.update({
        where: { id: current.booking.id },
        data: {
          status: "CONFIRMED",
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: current.booking.id,
          previousStatus: current.booking.status,
          newStatus: "CONFIRMED",
          changedById: input.actorId,
          note: verificationNote,
        },
      });
    });

    const paymentProof = await this.getPaymentProofById(input.vendorId, input.paymentProofId);
    if (!paymentProof) {
      throw new Error("Payment proof not found");
    }

    return {
      paymentProof,
      previousPaymentStatus,
      previousBookingStatus,
      bookingStatusChanged: previousBookingStatus !== paymentProof.booking.status,
    };
  }

  async rejectPaymentProof(input: {
    vendorId: string;
    paymentProofId: string;
    actorId: string;
    rejectionReason: string;
  }) {
    const current = await prisma.paymentProof.findFirst({
      where: {
        id: input.paymentProofId,
        booking: {
          vendorId: input.vendorId,
        },
      },
      select: {
        status: true,
        booking: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!current) {
      throw new Error("Payment proof not found");
    }

    const previousPaymentStatus = mapPaymentStatus(current.status);
    const previousBookingStatus = mapBookingStatus(current.booking.status);

    await prisma.$transaction(async (tx) => {
      const now = new Date();

      await tx.paymentProof.update({
        where: { id: input.paymentProofId },
        data: {
          status: "REJECTED",
          rejectedById: input.actorId,
          rejectedAt: now,
          rejectionReason: input.rejectionReason,
        },
      });

      await tx.paymentProofStatusHistory.create({
        data: {
          paymentProofId: input.paymentProofId,
          previousStatus: current.status,
          newStatus: "REJECTED",
          changedById: input.actorId,
          note: input.rejectionReason,
          isOverride: false,
        },
      });
    });

    const paymentProof = await this.getPaymentProofById(input.vendorId, input.paymentProofId);
    if (!paymentProof) {
      throw new Error("Payment proof not found");
    }

    return {
      paymentProof,
      previousPaymentStatus,
      previousBookingStatus,
      bookingStatusChanged: previousBookingStatus !== paymentProof.booking.status,
    };
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
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
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
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      createdAt: auditLog.createdAt,
    };
  }
}
