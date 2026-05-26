import "server-only";

import type {
  BookingDTO,
  CreateBookingInput,
  ListOptions,
  UpdateBookingStatusInput,
} from "@wo/shared-types";

import type { BookingRepository } from "../../domain/repositories";
import { prisma } from "../prisma";

export class PrismaBookingRepository implements BookingRepository {
  async findById(id: string): Promise<BookingDTO | null> {
    return prisma.booking.findUnique({ where: { id } });
  }

  async listByUser(userId: string, options?: ListOptions): Promise<BookingDTO[]> {
    return prisma.booking.findMany({
      where: { userId },
      take: options?.take,
      skip: options?.skip,
      orderBy: { createdAt: "desc" },
    });
  }

  async listByVendor(vendorId: string, options?: ListOptions): Promise<BookingDTO[]> {
    return prisma.booking.findMany({
      where: { vendorId },
      take: options?.take,
      skip: options?.skip,
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: CreateBookingInput): Promise<BookingDTO> {
    return prisma.booking.create({ data });
  }

  async updateStatus(id: string, data: UpdateBookingStatusInput): Promise<BookingDTO> {
    return prisma.booking.update({ where: { id }, data });
  }
}
