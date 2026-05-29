import "server-only";

import type {
  CreatePaymentProofInput,
  PaymentProofDTO,
  PaymentProofStatus,
  VerifyPaymentProofInput,
} from "@wo/shared-types";

import type { PaymentProofRepository } from "../../../domain/repositories";
import { prisma } from "../prisma";

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
): PaymentProofDTO | null => {
  if (!paymentProof) {
    return null;
  }

  return {
    ...paymentProof,
    status: paymentProof.status as PaymentProofStatus,
  };
};

export class PrismaPaymentProofRepository implements PaymentProofRepository {
  async findByBookingId(bookingId: string): Promise<PaymentProofDTO | null> {
    const proof = await prisma.paymentProof.findUnique({ where: { bookingId } });
    return mapPaymentProof(proof);
  }

  async create(data: CreatePaymentProofInput): Promise<PaymentProofDTO> {
    const proof = await prisma.paymentProof.create({ data });
    return mapPaymentProof(proof) as PaymentProofDTO;
  }

  async verify(id: string, data: VerifyPaymentProofInput): Promise<PaymentProofDTO> {
    const proof = await prisma.$transaction(async (tx) => {
      const current = await tx.paymentProof.findUnique({
        where: { id },
        select: {
          status: true,
        },
      });

      const updated = await tx.paymentProof.update({
        where: { id },
        data: {
          status: "VERIFIED",
          verifiedById: data.verifiedById,
          verifiedAt: data.verifiedAt ?? new Date(),
          verificationNote: data.verificationNote ?? null,
          rejectedById: null,
          rejectedAt: null,
          rejectionReason: null,
        },
      });

      await tx.paymentProofStatusHistory.create({
        data: {
          paymentProofId: id,
          previousStatus: current?.status ?? null,
          newStatus: "VERIFIED",
          changedById: data.verifiedById,
          note: data.verificationNote ?? null,
          isOverride: false,
        },
      });

      return updated;
    });

    return mapPaymentProof(proof) as PaymentProofDTO;
  }
}
