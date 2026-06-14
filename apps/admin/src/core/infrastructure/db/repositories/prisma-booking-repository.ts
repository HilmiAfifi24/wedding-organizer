import "server-only";

import type {
  BookingStatus,
  BookingDTO,
  CreateBookingInput,
  ListOptions,
  UpdateBookingStatusInput,
} from "@wo/shared-types";

import type { BookingRepository } from "@/core/domain/repositories";
import { prisma } from "../prisma";

const mapBooking = (booking: Omit<BookingDTO, "status"> & { status: string }): BookingDTO => ({
  ...booking,
  status: booking.status as BookingStatus,
});

export class PrismaBookingRepository implements BookingRepository {
  async findById(id: string): Promise<BookingDTO | null> {
    const booking = await prisma.booking.findUnique({ where: { id } });
    return booking ? mapBooking(booking) : null;
  }

  async listByUser(userId: string, options?: ListOptions): Promise<BookingDTO[]> {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      take: options?.take,
      skip: options?.skip,
      orderBy: { createdAt: "desc" },
    });

    return bookings.map(mapBooking);
  }

  async listByVendor(vendorId: string, options?: ListOptions): Promise<BookingDTO[]> {
    const bookings = await prisma.booking.findMany({
      where: { vendorId },
      take: options?.take,
      skip: options?.skip,
      orderBy: { createdAt: "desc" },
    });

    return bookings.map(mapBooking);
  }

  async create(data: CreateBookingInput): Promise<BookingDTO> {
    void data;
    throw new Error("Direct booking creation is not supported in Admin App");
  }

  async updateStatus(id: string, data: UpdateBookingStatusInput): Promise<BookingDTO> {
    const booking = await prisma.booking.update({ where: { id }, data });
    return mapBooking(booking);
  }
}
