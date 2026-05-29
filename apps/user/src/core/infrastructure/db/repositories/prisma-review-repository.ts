import "server-only";

import type { CreateReviewInput, ListOptions, ReviewDTO, ReviewStatus } from "@wo/shared-types";

import type { ReviewRepository } from "../../domain/repositories";
import { prisma } from "../prisma";

const mapReview = (
  review:
    | {
        id: string;
        bookingId: string;
        userId: string;
        vendorId: string;
        rating: number;
        comment: string | null;
        status: string;
        hiddenAt: Date | null;
        hiddenById: string | null;
        deletedAt: Date | null;
        deletedById: string | null;
        moderationReason: string | null;
        createdAt: Date;
        updatedAt: Date;
      }
    | null
): ReviewDTO | null => {
  if (!review) {
    return null;
  }

  return {
    ...review,
    status: review.status as ReviewStatus,
  };
};

export class PrismaReviewRepository implements ReviewRepository {
  async findByBookingId(bookingId: string): Promise<ReviewDTO | null> {
    const review = await prisma.review.findFirst({
      where: {
        bookingId,
        status: "VISIBLE",
        deletedAt: null,
      },
    });

    return mapReview(review);
  }

  async listByVendor(vendorId: string, options?: ListOptions): Promise<ReviewDTO[]> {
    const reviews = await prisma.review.findMany({
      where: {
        vendorId,
        status: "VISIBLE",
        deletedAt: null,
      },
      take: options?.take,
      skip: options?.skip,
      orderBy: { createdAt: "desc" },
    });

    return reviews.map((review) => mapReview(review) as ReviewDTO);
  }

  async create(data: CreateReviewInput): Promise<ReviewDTO> {
    const review = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: data.bookingId },
        select: {
          status: true,
          userId: true,
          vendorId: true,
        },
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.status !== "COMPLETED") {
        throw new Error("Review can only be created for completed booking");
      }

      if (booking.userId !== data.userId || booking.vendorId !== data.vendorId) {
        throw new Error("Review data does not match booking");
      }

      return tx.review.create({
        data: {
          ...data,
          status: "VISIBLE",
        },
      });
    });

    return mapReview(review) as ReviewDTO;
  }
}
