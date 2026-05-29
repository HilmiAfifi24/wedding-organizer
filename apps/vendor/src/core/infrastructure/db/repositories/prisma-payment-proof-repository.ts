import "server-only";

import type {
  CreatePaymentProofInput,
  PaymentProofDTO,
  VerifyPaymentProofInput,
} from "@wo/shared-types";

import type { PaymentProofRepository } from "../../../domain/repositories";
import { prisma } from "../prisma";

export class PrismaPaymentProofRepository implements PaymentProofRepository {
  async findByBookingId(bookingId: string): Promise<PaymentProofDTO | null> {
    const proof = await prisma.paymentProof.findUnique({ where: { bookingId } });
    if (!proof) return null;
    return proof as unknown as PaymentProofDTO;
  }

  async create(data: CreatePaymentProofInput): Promise<PaymentProofDTO> {
    const proof = await prisma.paymentProof.create({ data });
    return proof as unknown as PaymentProofDTO;
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

    return proof as unknown as PaymentProofDTO;
  }
}
