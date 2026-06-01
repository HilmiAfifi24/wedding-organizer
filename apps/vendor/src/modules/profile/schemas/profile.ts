import { INDONESIAN_PHONE_REGEX } from "@wo/shared-types";
import { z } from "zod";

const normalizeOptionalText = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const optionalUrlSchema = z
  .string()
  .optional()
  .transform((value, ctx) => {
    const normalized = normalizeOptionalText(value);

    if (!normalized) {
      return undefined;
    }

    try {
      return new URL(normalized).toString();
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "URL tidak valid",
      });
      return z.NEVER;
    }
  });

export const vendorProfileUpdateSchema = z.object({
  businessName: z.string().trim().min(3, "Nama bisnis minimal 3 karakter"),
  description: z
    .string()
    .trim()
    .max(1000, "Deskripsi maksimal 1000 karakter")
    .optional()
    .or(z.literal("")),
  categoryId: z.string().trim().min(1, "Kategori wajib dipilih"),
  businessType: z.string().trim().max(120, "Tipe bisnis maksimal 120 karakter").optional().or(z.literal("")),
  establishedYear: z
    .coerce
    .number()
    .int()
    .min(1900, "Tahun berdiri tidak valid")
    .max(new Date().getFullYear(), "Tahun berdiri tidak valid")
    .optional(),
  phoneNumber: z
    .string()
    .trim()
    .refine((value) => INDONESIAN_PHONE_REGEX.test(value), "Nomor telepon tidak valid"),
  whatsappNumber: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || INDONESIAN_PHONE_REGEX.test(value), "Nomor WhatsApp tidak valid"),
  website: optionalUrlSchema,
  businessAddress: z.string().trim().min(5, "Alamat bisnis wajib diisi"),
  city: z.string().trim().min(2, "Kota wajib diisi"),
  province: z.string().trim().min(2, "Provinsi wajib diisi"),
  postalCode: z.string().trim().max(12, "Kode pos maksimal 12 karakter").optional().or(z.literal("")),
  instagramUrl: optionalUrlSchema,
  tiktokUrl: optionalUrlSchema,
  facebookUrl: optionalUrlSchema,
  youtubeUrl: optionalUrlSchema,
});

export const vendorResubmitSchema = z.object({
  confirmation: z.literal(true),
  note: z.string().trim().max(500, "Catatan maksimal 500 karakter").optional().or(z.literal("")),
});

const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const createUploadImageSchema = (maxFileSizeBytes: number) =>
  z.object({
    file: z
      .instanceof(File)
      .refine((file) => allowedImageTypes.includes(file.type.toLowerCase()), "Tipe file tidak didukung")
      .refine((file) => file.size <= maxFileSizeBytes, `Ukuran file maksimal ${Math.floor(maxFileSizeBytes / (1024 * 1024))}MB`),
  });
