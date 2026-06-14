import { z } from "zod";
import { BookingStatus, PaymentStatus } from "@wo/shared-types";

const optionalDateString = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined)
  .refine((value) => !value || !Number.isNaN(Date.parse(value)), "Tanggal tidak valid");

export const bookingListSortValues = [
  "newest",
  "oldest",
  "event-date-nearest",
] as const;

export const bookingListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(24).default(6),
  search: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => value || undefined),
  bookingStatus: z.nativeEnum(BookingStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  eventDateFrom: optionalDateString,
  eventDateTo: optionalDateString,
  sort: z.enum(bookingListSortValues).default("newest"),
});

export const bookingDetailParamSchema = z.object({
  id: z.string().uuid("Booking ID tidak valid"),
});
