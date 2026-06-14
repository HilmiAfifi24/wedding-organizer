import { z } from "zod";

import { isPastBookingEventDate } from "../services/event-date";

const optionalTextSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

const optionalGuestCountSchema = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.coerce
    .number()
    .int("Jumlah tamu harus bilangan bulat")
    .positive("Jumlah tamu harus lebih dari 0")
    .max(100000, "Jumlah tamu terlalu besar")
    .optional()
);

export const createBookingSchema = z.object({
  vendorId: z.string().trim().min(1, "Vendor wajib dipilih"),
  serviceId: z.string().trim().min(1, "Layanan wajib dipilih"),
  eventDate: z
    .string()
    .trim()
    .min(1, "Tanggal acara wajib diisi")
    .refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), "Tanggal acara tidak valid")
    .refine((value) => !isPastBookingEventDate(value), "Tanggal acara tidak boleh di masa lalu"),
  eventLocation: z.string().trim().min(5, "Lokasi acara wajib diisi"),
  customerName: z.string().trim().min(3, "Nama customer wajib diisi"),
  customerPhone: z.string().trim().min(8, "Nomor telepon wajib diisi"),
  customerEmail: z.string().trim().email("Email customer tidak valid"),
  guestCount: optionalGuestCountSchema,
  notes: optionalTextSchema,
  specialRequest: optionalTextSchema,
});

export const bookingCreatePageQuerySchema = z.object({
  vendorId: z.string().trim().min(1, "Vendor wajib dipilih"),
  serviceId: z.string().trim().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
