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
    const proof = await prisma.paymentProof.update({ where: { id }, data });
    return proof as unknown as PaymentProofDTO;
  }
}
