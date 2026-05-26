import type {
  BookingDTO,
  CreateBookingInput,
  ListOptions,
  UpdateBookingStatusInput,
} from "@wo/shared-types";

export interface BookingRepository {
  findById(id: string): Promise<BookingDTO | null>;
  listByUser(userId: string, options?: ListOptions): Promise<BookingDTO[]>;
  listByVendor(vendorId: string, options?: ListOptions): Promise<BookingDTO[]>;
  create(data: CreateBookingInput): Promise<BookingDTO>;
  updateStatus(id: string, data: UpdateBookingStatusInput): Promise<BookingDTO>;
}
