import "server-only";

import type {
  AdminPaymentProofDetailDTO,
  AdminPaymentProofListItemDTO,
  AdminPaymentProofsQuery,
  AuditLogDTO,
  AuditModule,
  BookingStatus,
  CreateAuditLogInput,
  PaymentProofStatus,
  PaymentProofStatusHistoryDTO,
  PaymentTermStatus,
  PaymentType,
  Role,
} from "@wo/shared-types";
import { PaymentStatus } from "@wo/shared-types";

import { sanitizeAuditValue } from "@/core/domain/entities/audit-log-dashboard";
import {
  mapPrismaPaymentProofStatusToDto,
  mapPrismaVendorStatusToDto,
  type PaymentMonitoringPermissionFlags,
} from "@/core/domain/entities/payment-monitoring";
import type { PaymentMonitoringRepository } from "@/core/domain/repositories";

import { prisma } from "../prisma";

type PrismaPaymentProofListRecord = {
  id: string;
  bookingId: string;
  paymentTermId: string;
  amount: number;
  fileUrl: string;
  status: string;
  verifiedAt: Date | null;
  rejectedAt: Date | null;
  overriddenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  paymentTerm: {
    type: string;
    status: string;
    sequence: number;
  };
  booking: {
    id: string;
    status: string;
    paymentStatus: string;
    userId: string;
    vendorId: string;
    user: {
      name: string | null;
      email: string;
    };
    vendor: {
      name: string;
      status: string;
    };
  };
};

const mapBookingStatus = (status: string) => status as BookingStatus;
const mapPaymentStatus = (status: string) => mapPrismaPaymentProofStatusToDto(status);
const mapPaymentType = (type: string) => type as PaymentType;
const mapPaymentTermStatus = (status: string) => status as PaymentTermStatus;

const deriveBookingPaymentStatus = (termStatuses: string[]): PaymentStatus => {
  if (termStatuses.length > 0 && termStatuses.every((status) => status === "VERIFIED")) {
    return PaymentStatus.PAID;
  }

  if (termStatuses.some((status) => status === "VERIFIED")) {
    return PaymentStatus.PARTIALLY_PAID;
  }

  return PaymentStatus.UNPAID;
};

const mapPaymentProofListItem = (
  paymentProof: PrismaPaymentProofListRecord
): AdminPaymentProofListItemDTO => ({
  id: paymentProof.id,
  bookingId: paymentProof.bookingId,
  paymentTermId: paymentProof.paymentTermId,
  paymentTermType: mapPaymentType(paymentProof.paymentTerm.type),
  paymentTermStatus: mapPaymentTermStatus(paymentProof.paymentTerm.status),
  paymentTermSequence: paymentProof.paymentTerm.sequence,
  amount: paymentProof.amount,
  paymentProofStatus: mapPaymentStatus(paymentProof.status),
  bookingStatus: mapBookingStatus(paymentProof.booking.status),
  fileUrl: paymentProof.fileUrl,
  uploadedAt: paymentProof.createdAt,
  updatedAt: paymentProof.updatedAt,
  userId: paymentProof.booking.userId,
  userName: paymentProof.booking.user.name,
  userEmail: paymentProof.booking.user.email,
  vendorId: paymentProof.booking.vendorId,
  vendorName: paymentProof.booking.vendor.name,
  vendorStatus: mapPrismaVendorStatusToDto(paymentProof.booking.vendor.status),
  verifiedAt: paymentProof.verifiedAt,
  rejectedAt: paymentProof.rejectedAt,
  overriddenAt: paymentProof.overriddenAt,
});

const toJsonValue = (value: unknown) => {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value));
};

export class PrismaPaymentMonitoringRepository implements PaymentMonitoringRepository {
  async getActorPermissionByMenuCode(
    actorId: string,
    menuCode: string
  ): Promise<PaymentMonitoringPermissionFlags | null> {
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

  async listPaymentProofs(
    query: Required<
      Pick<AdminPaymentProofsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">
    > &
      Omit<AdminPaymentProofsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">
  ): Promise<{ items: AdminPaymentProofListItemDTO[]; totalItems: number }> {
    const skip = (query.page - 1) * query.pageSize;

    const where = {
      AND: [
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
                {
                  booking: {
                    user: {
                      email: { contains: query.search, mode: "insensitive" as const },
                    },
                  },
                },
                {
                  booking: {
                    vendor: {
                      name: { contains: query.search, mode: "insensitive" as const },
                    },
                  },
                },
              ],
            }
          : {},
        query.paymentProofStatus ? { status: query.paymentProofStatus } : {},
        query.bookingStatus ? { booking: { status: query.bookingStatus } } : {},
        query.vendor
          ? {
              booking: {
                vendor: {
                  name: { contains: query.vendor, mode: "insensitive" as const },
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
      query.sortBy === "status"
        ? ({ status: query.sortDirection } as const)
        : query.sortBy === "verifiedAt"
          ? ({ verifiedAt: query.sortDirection } as const)
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
              status: true,
              paymentStatus: true,
              userId: true,
              vendorId: true,
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
            },
          },
          paymentTerm: {
            select: {
              type: true,
              status: true,
              sequence: true,
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

  async getPaymentProofById(paymentProofId: string): Promise<AdminPaymentProofDetailDTO | null> {
    const paymentProof = await prisma.paymentProof.findUnique({
      where: { id: paymentProofId },
      include: {
        booking: {
          select: {
            id: true,
            bookedAt: true,
            status: true,
            paymentStatus: true,
            totalAmount: true,
            notes: true,
            serviceId: true,
            userId: true,
            vendorId: true,
            service: {
              select: {
                name: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            vendor: {
              select: {
                id: true,
                name: true,
                status: true,
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
          },
        },
        paymentTerm: {
          select: {
            type: true,
            status: true,
            sequence: true,
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
        overriddenBy: {
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
        paymentTermId: paymentProof.paymentTermId,
        amount: paymentProof.amount,
        fileUrl: paymentProof.fileUrl,
        status: paymentProof.status,
        verifiedAt: paymentProof.verifiedAt,
        rejectedAt: paymentProof.rejectedAt,
        overriddenAt: paymentProof.overriddenAt,
        createdAt: paymentProof.createdAt,
        updatedAt: paymentProof.updatedAt,
        paymentTerm: {
          type: paymentProof.paymentTerm.type,
          status: paymentProof.paymentTerm.status,
          sequence: paymentProof.paymentTerm.sequence,
        },
        booking: {
          id: paymentProof.booking.id,
          status: paymentProof.booking.status,
          paymentStatus: paymentProof.booking.paymentStatus,
          userId: paymentProof.booking.userId,
          vendorId: paymentProof.booking.vendorId,
          user: {
            name: paymentProof.booking.user.name,
            email: paymentProof.booking.user.email,
          },
          vendor: {
            name: paymentProof.booking.vendor.name,
            status: paymentProof.booking.vendor.status,
          },
        },
      }),
      note: paymentProof.note,
      verificationNote: paymentProof.verificationNote,
      rejectionReason: paymentProof.rejectionReason,
      overrideReason: paymentProof.overrideReason,
      verifiedById: paymentProof.verifiedById,
      verifiedByName: paymentProof.verifiedBy?.name ?? null,
      rejectedById: paymentProof.rejectedById,
      rejectedByName: paymentProof.rejectedBy?.name ?? null,
      overriddenById: paymentProof.overriddenById,
      overriddenByName: paymentProof.overriddenBy?.name ?? null,
      booking: {
        id: paymentProof.booking.id,
        bookedAt: paymentProof.booking.bookedAt,
        status: mapBookingStatus(paymentProof.booking.status),
        notes: paymentProof.booking.notes,
        serviceId: paymentProof.booking.serviceId,
        serviceName: paymentProof.booking.service?.name ?? null,
        totalAmount: paymentProof.booking.totalAmount ?? null,
      },
      user: {
        id: paymentProof.booking.user.id,
        name: paymentProof.booking.user.name,
        email: paymentProof.booking.user.email,
        role: paymentProof.booking.user.role as Role,
      },
      vendor: {
        id: paymentProof.booking.vendor.id,
        name: paymentProof.booking.vendor.name,
        status: mapPrismaVendorStatusToDto(paymentProof.booking.vendor.status),
        ownerName: paymentProof.booking.vendor.owner.name,
        ownerEmail: paymentProof.booking.vendor.owner.email,
        categoryName: paymentProof.booking.vendor.category?.name ?? null,
      },
    };
  }

  async getPaymentProofHistory(paymentProofId: string): Promise<PaymentProofStatusHistoryDTO[]> {
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

  async forceVerifyPaymentProof(input: {
    paymentProofId: string;
    actorId: string;
    reason: string;
  }): Promise<{
    paymentProof: AdminPaymentProofDetailDTO;
    bookingStatusChanged: boolean;
    previousPaymentStatus: PaymentProofStatus;
    previousBookingStatus: BookingStatus;
  }> {
    const current = await prisma.paymentProof.findUnique({
      where: { id: input.paymentProofId },
      select: {
        id: true,
        status: true,
        paymentTermId: true,
        paymentTerm: {
          select: {
            type: true,
          },
        },
        booking: {
          select: {
            id: true,
            status: true,
            paymentTerms: {
              select: {
                id: true,
                status: true,
              },
            },
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
          status: "VERIFIED",
          verifiedById: input.actorId,
          verifiedAt: now,
          verificationNote: input.reason,
          overriddenById: input.actorId,
          overriddenAt: now,
          overrideReason: input.reason,
          rejectedById: null,
          rejectedAt: null,
          rejectionReason: null,
        },
      });

      await tx.paymentTerm.update({
        where: { id: current.paymentTermId },
        data: {
          status: "VERIFIED",
        },
      });

      await tx.paymentProofStatusHistory.create({
        data: {
          paymentProofId: input.paymentProofId,
          previousStatus: current.status,
          newStatus: "VERIFIED",
          changedById: input.actorId,
          note: input.reason,
          isOverride: true,
        },
      });

      const nextTermStatuses = current.booking.paymentTerms.map((term) =>
        term.id === current.paymentTermId ? "VERIFIED" : term.status
      );
      const nextBookingPaymentStatus = deriveBookingPaymentStatus(nextTermStatuses);
      const shouldConfirmBooking =
        current.paymentTerm.type === "DP" && current.booking.status === "PENDING_PAYMENT";

      await tx.booking.update({
        where: { id: current.booking.id },
        data: {
          status: shouldConfirmBooking ? "CONFIRMED" : undefined,
          paymentStatus: nextBookingPaymentStatus,
        },
      });

      if (shouldConfirmBooking) {
        await tx.bookingStatusHistory.create({
          data: {
            bookingId: current.booking.id,
            previousStatus: current.booking.status,
            newStatus: "CONFIRMED",
            changedById: input.actorId,
            note: `Admin force verify payment: ${input.reason}`,
          },
        });
      }
    });

    const paymentProof = await this.getPaymentProofById(input.paymentProofId);
    if (!paymentProof) {
      throw new Error("Payment proof not found");
    }

    return {
      paymentProof,
      bookingStatusChanged: previousBookingStatus !== paymentProof.booking.status,
      previousPaymentStatus,
      previousBookingStatus,
    };
  }

  async forceRejectPaymentProof(input: {
    paymentProofId: string;
    actorId: string;
    reason: string;
  }): Promise<{
    paymentProof: AdminPaymentProofDetailDTO;
    bookingStatusChanged: boolean;
    previousPaymentStatus: PaymentProofStatus;
    previousBookingStatus: BookingStatus;
  }> {
    const current = await prisma.paymentProof.findUnique({
      where: { id: input.paymentProofId },
      select: {
        id: true,
        status: true,
        paymentTermId: true,
        booking: {
          select: {
            id: true,
            status: true,
            paymentTerms: {
              select: {
                id: true,
                status: true,
              },
            },
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
          rejectionReason: input.reason,
          overriddenById: input.actorId,
          overriddenAt: now,
          overrideReason: input.reason,
        },
      });

      await tx.paymentTerm.update({
        where: { id: current.paymentTermId },
        data: {
          status: "REJECTED",
        },
      });

      await tx.paymentProofStatusHistory.create({
        data: {
          paymentProofId: input.paymentProofId,
          previousStatus: current.status,
          newStatus: "REJECTED",
          changedById: input.actorId,
          note: input.reason,
          isOverride: true,
        },
      });

      const nextTermStatuses = current.booking.paymentTerms.map((term) =>
        term.id === current.paymentTermId ? "REJECTED" : term.status
      );
      const nextBookingPaymentStatus = deriveBookingPaymentStatus(nextTermStatuses);

      await tx.booking.update({
        where: { id: current.booking.id },
        data: {
          paymentStatus: nextBookingPaymentStatus,
        },
      });
    });

    const paymentProof = await this.getPaymentProofById(input.paymentProofId);
    if (!paymentProof) {
      throw new Error("Payment proof not found");
    }

    return {
      paymentProof,
      bookingStatusChanged: previousBookingStatus !== paymentProof.booking.status,
      previousPaymentStatus,
      previousBookingStatus,
    };
  }

  async createAuditLog(data: CreateAuditLogInput): Promise<AuditLogDTO> {
    const auditLog = await prisma.auditLog.create({
      data: {
        actorId: data.actorId,
        module: data.module,
        action: data.action,
        targetId: data.targetId,
        beforeData: toJsonValue(sanitizeAuditValue(data.beforeData)),
        afterData: toJsonValue(sanitizeAuditValue(data.afterData)),
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
