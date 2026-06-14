import "server-only";

import type {
  BookingDTO,
  CreateBookingInput,
  ListOptions,
  UpdateBookingStatusInput,
} from "@wo/shared-types";

import type { BookingRepository } from "../../../domain/repositories";
import { prisma } from "../prisma";

export class PrismaBookingRepository implements BookingRepository {
  async findById(id: string): Promise<BookingDTO | null> {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return null;
    return booking as unknown as BookingDTO;
  }

  async listByUser(userId: string, options?: ListOptions): Promise<BookingDTO[]> {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      take: options?.take,
      skip: options?.skip,
      orderBy: { createdAt: "desc" },
    });
    return bookings as unknown as BookingDTO[];
  }

  async listByVendor(vendorId: string, options?: ListOptions): Promise<BookingDTO[]> {
    const bookings = await prisma.booking.findMany({
      where: { vendorId },
      take: options?.take,
      skip: options?.skip,
      orderBy: { createdAt: "desc" },
    });
    return bookings as unknown as BookingDTO[];
  }

  async create(data: CreateBookingInput): Promise<BookingDTO> {
    void data;
    throw new Error("Direct booking creation is not supported in Vendor App");
  }

  async updateStatus(id: string, data: UpdateBookingStatusInput): Promise<BookingDTO> {
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: data.status as
          | "PENDING"
          | "PENDING_PAYMENT"
          | "CONFIRMED"
          | "REJECTED"
          | "COMPLETED"
          | "CANCELLED",
      },
    });
    return booking as unknown as BookingDTO;
  }
}
