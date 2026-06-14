import { z } from "zod";
import { PaymentProofStatus } from "@wo/shared-types";

import { DEFAULT_PAYMENT_PROOF_MAX_BYTES, PAYMENT_PROOF_ALLOWED_MIME_TYPES } from "../constants";

const isFile = (value: unknown): value is File => typeof File !== "undefined" && value instanceof File;

export const paymentProofUploadSchema = z.object({
  bookingId: z.string().trim().min(1, "Booking wajib dipilih"),
  paymentTermId: z.string().trim().min(1, "Termin pembayaran wajib dipilih"),
  amount: z.coerce.number().positive("Nominal pembayaran harus lebih dari 0"),
  file: z
    .custom<File>((value) => isFile(value), "File bukti pembayaran wajib diunggah")
    .refine(
      (file) => file.size > 0,
      "File bukti pembayaran wajib diunggah"
    )
    .refine(
      (file) => PAYMENT_PROOF_ALLOWED_MIME_TYPES.includes(file.type as (typeof PAYMENT_PROOF_ALLOWED_MIME_TYPES)[number]),
      "Format file tidak didukung"
    )
    .refine(
      (file) => file.size <= DEFAULT_PAYMENT_PROOF_MAX_BYTES,
      "Ukuran file melebihi batas maksimal"
    ),
  note: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined),
});

export const paymentQuerySchema = z.object({
  status: z.nativeEnum(PaymentProofStatus).optional(),
  dateFrom: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? new Date(value) : undefined))
    .refine((value) => !value || !Number.isNaN(value.getTime()), "Tanggal awal tidak valid"),
  dateTo: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? new Date(value) : undefined))
    .refine((value) => !value || !Number.isNaN(value.getTime()), "Tanggal akhir tidak valid"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export const paymentUploadPageQuerySchema = z.object({
  termId: z.string().trim().min(1, "Termin pembayaran wajib dipilih"),
});

export type PaymentProofUploadInput = z.infer<typeof paymentProofUploadSchema>;
export type PaymentQueryInput = z.infer<typeof paymentQuerySchema>;
