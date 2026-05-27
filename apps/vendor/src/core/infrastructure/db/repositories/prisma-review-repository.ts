import "server-only";

import type { CreateReviewInput, ListOptions, ReviewDTO } from "@wo/shared-types";

import type { ReviewRepository } from "../../../domain/repositories";
import { prisma } from "../prisma";

export class PrismaReviewRepository implements ReviewRepository {
  async findByBookingId(bookingId: string): Promise<ReviewDTO | null> {
    const review = await prisma.review.findUnique({ where: { bookingId } });
    if (!review) return null;
    return review as unknown as ReviewDTO;
  }

  async listByVendor(vendorId: string, options?: ListOptions): Promise<ReviewDTO[]> {
    const reviews = await prisma.review.findMany({
      where: { vendorId },
      take: options?.take,
      skip: options?.skip,
      orderBy: { createdAt: "desc" },
    });
    return reviews as unknown as ReviewDTO[];
  }

  async create(data: CreateReviewInput): Promise<ReviewDTO> {
    const review = await prisma.review.create({ data });
    return review as unknown as ReviewDTO;
  }
}
