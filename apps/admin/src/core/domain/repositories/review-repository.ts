import type { CreateReviewInput, ListOptions, ReviewDTO } from "@wo/shared-types";

export interface ReviewRepository {
  findByBookingId(bookingId: string): Promise<ReviewDTO | null>;
  listByVendor(vendorId: string, options?: ListOptions): Promise<ReviewDTO[]>;
  create(data: CreateReviewInput): Promise<ReviewDTO>;
}
