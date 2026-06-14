import "server-only";

import type {
  BookingStatus,
  PaginatedResult,
  PaymentProofStatus,
  PaymentStatus,
  PaymentTermStatus,
  PaymentType,
} from "@wo/shared-types";

import type {
  CreateUserPaymentProofInput,
  UserBookingPaymentSummaryDTO,
  UserPaymentAuditLogInput,
  UserPaymentProofDetailDTO,
  UserPaymentProofListItemDTO,
  UserPaymentProofSummaryDTO,
  UserPaymentRepository,
  UserPaymentTermItemDTO,
  UserPaymentsQuery,
  UserPaymentTermUploadContextDTO,
} from "@/core/domain/repositories/user-payment-repository";

import { prisma } from "../prisma";

const mapBookingStatus = (status: string) => status as BookingStatus;
const mapPaymentStatus = (status: string) => status as PaymentStatus;
const mapPaymentProofStatus = (status: string) => status as PaymentProofStatus;
const mapPaymentTermStatus = (status: string) => status as PaymentTermStatus;
const mapPaymentType = (type: string) => type as PaymentType;

const toJsonValue = (value: unknown) => {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value));
};

const mapLatestProofSummary = (
  proof:
    | {
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
      }
    | null
    | undefined
): UserPaymentProofSummaryDTO | null => {
  if (!proof) {
    return null;
  }

  return {
    id: proof.id,
    paymentTermId: proof.paymentTermId,
    amount: proof.amount,
    fileUrl: proof.fileUrl,
    status: mapPaymentProofStatus(proof.status),
    note: proof.note,
    verificationNote: proof.verificationNote,
    rejectionReason: proof.rejectionReason,
    createdAt: proof.createdAt,
    updatedAt: proof.updatedAt,
  };
};

const mapTermItem = (term: {
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
}): UserPaymentTermItemDTO => ({
  id: term.id,
  bookingId: term.bookingId,
  type: mapPaymentType(term.type),
  amount: term.amount,
  status: mapPaymentTermStatus(term.status),
  dueDate: term.dueDate,
  sequence: term.sequence,
  latestProof: mapLatestProofSummary(term.paymentProofs[0]),
});

const buildSummaryTotals = (terms: UserPaymentTermItemDTO[], bookingTotalAmount: number) => {
  const totalPaidAmount = terms
    .filter((term) => term.status === "VERIFIED")
    .reduce((sum, term) => sum + term.amount, 0);

  return {
    totalPaidAmount,
    remainingBalance: Math.max(bookingTotalAmount - totalPaidAmount, 0),
  };
};

export class PrismaUserPaymentRepository implements UserPaymentRepository {
  async listPaymentProofsByUser(
    userId: string,
    query: UserPaymentsQuery
  ): Promise<PaginatedResult<UserPaymentProofListItemDTO>> {
    const skip = (query.page - 1) * query.limit;
    const where = {
      AND: [
        {
          booking: {
            is: {
              userId,
            },
          },
        },
        query.status ? { status: query.status } : {},
        query.dateFrom || query.dateTo
          ? {
              createdAt: {
                ...(query.dateFrom ? { gte: query.dateFrom } : {}),
                ...(query.dateTo ? { lte: query.dateTo } : {}),
              },
            }
          : {},
      ],
    };

    const [items, totalItems] = await prisma.$transaction([
      prisma.paymentProof.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          booking: {
            select: {
              id: true,
              bookingCode: true,
              status: true,
              paymentStatus: true,
              vendor: {
                select: {
                  id: true,
                  businessName: true,
                  city: true,
                  province: true,
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
          },
          paymentTerm: {
            select: {
              id: true,
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
      items: items.map((item) => ({
        id: item.id,
        bookingId: item.bookingId,
        bookingCode: item.booking.bookingCode,
        bookingStatus: mapBookingStatus(item.booking.status),
        paymentStatus: mapPaymentStatus(item.booking.paymentStatus),
        paymentTermId: item.paymentTermId,
        paymentTermType: mapPaymentType(item.paymentTerm.type),
        paymentTermStatus: mapPaymentTermStatus(item.paymentTerm.status),
        paymentTermSequence: item.paymentTerm.sequence,
        amount: item.amount,
        fileUrl: item.fileUrl,
        status: mapPaymentProofStatus(item.status),
        uploadedAt: item.createdAt,
        updatedAt: item.updatedAt,
        vendor: {
          id: item.booking.vendor.id,
          businessName: item.booking.vendor.businessName ?? "Vendor",
          city: item.booking.vendor.city,
          province: item.booking.vendor.province,
        },
        service: item.booking.service
          ? {
              id: item.booking.service.id,
              name: item.booking.service.name,
              price: item.booking.service.price,
            }
          : null,
        verificationNote: item.verificationNote,
        rejectionReason: item.rejectionReason,
      })),
      page: query.page,
      pageSize: query.limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / query.limit)),
    };
  }

  async findPaymentProofByIdForUser(
    paymentProofId: string,
    userId: string
  ): Promise<UserPaymentProofDetailDTO | null> {
    const proof = await prisma.paymentProof.findFirst({
      where: {
        id: paymentProofId,
        booking: {
          is: {
            userId,
          },
        },
      },
      include: {
        booking: {
          select: {
            id: true,
            bookingCode: true,
            status: true,
            paymentStatus: true,
            vendor: {
              select: {
                id: true,
                businessName: true,
                city: true,
                province: true,
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
        },
        paymentTerm: {
          select: {
            id: true,
            type: true,
            status: true,
            sequence: true,
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

    if (!proof) {
      return null;
    }

    return {
      id: proof.id,
      bookingId: proof.bookingId,
      bookingCode: proof.booking.bookingCode,
      bookingStatus: mapBookingStatus(proof.booking.status),
      paymentStatus: mapPaymentStatus(proof.booking.paymentStatus),
      paymentTermId: proof.paymentTermId,
      paymentTermType: mapPaymentType(proof.paymentTerm.type),
      paymentTermStatus: mapPaymentTermStatus(proof.paymentTerm.status),
      paymentTermSequence: proof.paymentTerm.sequence,
      amount: proof.amount,
      fileUrl: proof.fileUrl,
      status: mapPaymentProofStatus(proof.status),
      uploadedAt: proof.createdAt,
      updatedAt: proof.updatedAt,
      vendor: {
        id: proof.booking.vendor.id,
        businessName: proof.booking.vendor.businessName ?? "Vendor",
        city: proof.booking.vendor.city,
        province: proof.booking.vendor.province,
      },
      service: proof.booking.service
        ? {
            id: proof.booking.service.id,
            name: proof.booking.service.name,
            price: proof.booking.service.price,
          }
        : null,
      verificationNote: proof.verificationNote,
      rejectionReason: proof.rejectionReason,
      note: proof.note,
      history: proof.statusHistory.map((item) => ({
        id: item.id,
        paymentProofId: item.paymentProofId,
        previousStatus: item.previousStatus ? mapPaymentProofStatus(item.previousStatus) : null,
        newStatus: mapPaymentProofStatus(item.newStatus),
        changedById: item.changedById,
        changedByName: item.changedBy?.name ?? null,
        note: item.note,
        isOverride: item.isOverride,
        createdAt: item.createdAt,
      })),
    };
  }

  async findBookingPaymentsByBookingIdForUser(
    bookingId: string,
    userId: string
  ): Promise<UserBookingPaymentSummaryDTO | null> {
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId,
      },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            city: true,
            province: true,
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
          orderBy: {
            sequence: "asc",
          },
          include: {
            paymentProofs: {
              orderBy: {
                createdAt: "desc",
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
      },
    });

    if (!booking || !booking.vendor.businessName) {
      return null;
    }

    const terms = booking.paymentTerms.map((term) => mapTermItem(term));
    const totals = buildSummaryTotals(terms, booking.totalAmount);

    return {
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      bookingStatus: mapBookingStatus(booking.status),
      paymentStatus: mapPaymentStatus(booking.paymentStatus),
      totalAmount: booking.totalAmount,
      totalPaidAmount: totals.totalPaidAmount,
      remainingBalance: totals.remainingBalance,
      vendor: {
        id: booking.vendor.id,
        businessName: booking.vendor.businessName,
        city: booking.vendor.city,
        province: booking.vendor.province,
      },
      service: booking.service
        ? {
            id: booking.service.id,
            name: booking.service.name,
            price: booking.service.price,
          }
        : null,
      terms,
    };
  }

  async findPaymentTermByIdForUser(
    paymentTermId: string,
    userId: string
  ): Promise<UserPaymentTermUploadContextDTO | null> {
    const term = await prisma.paymentTerm.findFirst({
      where: {
        id: paymentTermId,
        booking: {
          is: {
            userId,
          },
        },
      },
      include: {
        booking: {
          select: {
            id: true,
            bookingCode: true,
            status: true,
            paymentStatus: true,
            totalAmount: true,
            vendor: {
              select: {
                id: true,
                businessName: true,
                city: true,
                province: true,
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
        },
        paymentProofs: {
          orderBy: {
            createdAt: "desc",
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
    });

    if (!term || !term.booking.vendor.businessName) {
      return null;
    }

    return {
      bookingId: term.booking.id,
      bookingCode: term.booking.bookingCode,
      bookingStatus: mapBookingStatus(term.booking.status),
      paymentStatus: mapPaymentStatus(term.booking.paymentStatus),
      totalAmount: term.booking.totalAmount,
      vendor: {
        id: term.booking.vendor.id,
        businessName: term.booking.vendor.businessName,
        city: term.booking.vendor.city,
        province: term.booking.vendor.province,
      },
      service: term.booking.service
        ? {
            id: term.booking.service.id,
            name: term.booking.service.name,
            price: term.booking.service.price,
          }
        : null,
      term: mapTermItem(term),
    };
  }

  async createPaymentProofUpload(
    input: CreateUserPaymentProofInput,
    auditLog: UserPaymentAuditLogInput
  ): Promise<UserPaymentProofDetailDTO> {
    const proof = await prisma.$transaction(async (tx) => {
      const created = await tx.paymentProof.create({
        data: {
          bookingId: input.bookingId,
          paymentTermId: input.paymentTermId,
          uploadedById: input.uploadedById,
          amount: input.amount,
          fileUrl: input.fileUrl,
          note: input.note ?? null,
          status: "PENDING",
        },
      });

      await tx.paymentProofStatusHistory.create({
        data: {
          paymentProofId: created.id,
          previousStatus: null,
          newStatus: "PENDING",
          changedById: input.uploadedById,
          note: input.note ?? "Payment proof uploaded by user",
          isOverride: false,
        },
      });

      await tx.paymentTerm.update({
        where: { id: input.paymentTermId },
        data: {
          status: "PENDING_VERIFICATION",
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: auditLog.actorId,
          module: auditLog.module,
          action: auditLog.action,
          targetId: created.id,
          beforeData: toJsonValue(auditLog.beforeData),
          afterData: toJsonValue(auditLog.afterData),
          ipAddress: auditLog.ipAddress ?? null,
          userAgent: auditLog.userAgent ?? null,
        },
      });

      return created.id;
    });

    const detail = await this.findPaymentProofByIdForUser(proof, input.uploadedById);

    if (!detail) {
      throw new Error("Payment proof berhasil diunggah tetapi detail gagal dimuat");
    }

    return detail;
  }
}
