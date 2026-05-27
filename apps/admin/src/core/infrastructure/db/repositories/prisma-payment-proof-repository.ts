import "server-only";

import type {
  CreatePaymentProofInput,
  PaymentProofDTO,
  VerifyPaymentProofInput,
} from "@wo/shared-types";

import type { PaymentProofRepository } from "@/core/domain/repositories";
import { prisma } from "../prisma";

export class PrismaPaymentProofRepository implements PaymentProofRepository {
  async findByBookingId(bookingId: string): Promise<PaymentProofDTO | null> {
    return prisma.paymentProof.findUnique({ where: { bookingId } });
  }

  async create(data: CreatePaymentProofInput): Promise<PaymentProofDTO> {
    return prisma.paymentProof.create({ data });
  }

  async verify(id: string, data: VerifyPaymentProofInput): Promise<PaymentProofDTO> {
    return prisma.paymentProof.update({ where: { id }, data });
  }
}
