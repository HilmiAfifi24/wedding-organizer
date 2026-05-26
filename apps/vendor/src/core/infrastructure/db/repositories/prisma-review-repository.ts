import "server-only";

import type { CreateReviewInput, ListOptions, ReviewDTO } from "@wo/shared-types";

import type { ReviewRepository } from "../../domain/repositories";
import { prisma } from "../prisma";

export class PrismaReviewRepository implements ReviewRepository {
  async findByBookingId(bookingId: string): Promise<ReviewDTO | null> {
    return prisma.review.findUnique({ where: { bookingId } });
  }

  async listByVendor(vendorId: string, options?: ListOptions): Promise<ReviewDTO[]> {
    return prisma.review.findMany({
      where: { vendorId },
      take: options?.take,
      skip: options?.skip,
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: CreateReviewInput): Promise<ReviewDTO> {
    return prisma.review.create({ data });
  }
}
