import { MediaType } from "@wo/shared-types";
import { z } from "zod";

const normalizeText = (value: string) => value.trim();
const dataUrlPattern = /^data:[a-z]+\/[a-z0-9.+-]+(?:;[a-z0-9=-]+)*,.*$/i;

const mediaUrlSchema = z.string().trim().transform((value, ctx) => {
  if (dataUrlPattern.test(value)) {
    return value;
  }

  try {
    return new URL(value).toString();
  } catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Media URL harus berupa URL valid",
    });
    return z.NEVER;
  }
});

const initialServiceSchema = z.object({
  name: z.string().trim().min(2, "Nama layanan minimal 2 karakter"),
  description: z
    .string()
    .trim()
    .max(1000, "Deskripsi layanan maksimal 1000 karakter")
    .optional()
    .or(z.literal("")),
  price: z.coerce.number().int().min(0, "Harga layanan tidak valid"),
  isActive: z.boolean().optional().default(true),
});

const initialPortfolioSchema = z.object({
  title: z
    .string()
    .trim()
    .max(120, "Judul portfolio maksimal 120 karakter")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(1000, "Deskripsi portfolio maksimal 1000 karakter")
    .optional()
    .or(z.literal("")),
  mediaUrl: mediaUrlSchema,
  mediaType: z.nativeEnum(MediaType),
});

export const registerAccountStepSchema = z
  .object({
    ownerName: z.string().trim().min(2, "Nama owner minimal 2 karakter"),
    email: z.string().email("Format email tidak valid").transform(normalizeText),
    phoneNumber: z.string().trim().min(9, "Nomor telepon minimal 9 digit"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
    businessName: z.string().trim().min(3, "Nama bisnis minimal 3 karakter"),
    categoryId: z.string().trim().min(1, "Harap pilih kategori"),
    businessAddress: z.string().trim().min(5, "Alamat bisnis wajib diisi"),
    city: z.string().trim().min(2, "Kota wajib diisi"),
    province: z.string().trim().min(2, "Provinsi wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export const registerServiceStepSchema = initialServiceSchema;
export const registerPortfolioStepSchema = initialPortfolioSchema;

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid").transform(normalizeText),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z
  .object({
    ownerName: registerAccountStepSchema.shape.ownerName,
    email: registerAccountStepSchema.shape.email,
    phoneNumber: registerAccountStepSchema.shape.phoneNumber,
    password: registerAccountStepSchema.shape.password,
    confirmPassword: registerAccountStepSchema.shape.confirmPassword,
    businessName: registerAccountStepSchema.shape.businessName,
    categoryId: registerAccountStepSchema.shape.categoryId,
    businessAddress: registerAccountStepSchema.shape.businessAddress,
    city: registerAccountStepSchema.shape.city,
    province: registerAccountStepSchema.shape.province,
    initialService: initialServiceSchema,
    initialPortfolio: initialPortfolioSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export const onboardingSchema = z.object({
  businessName: z.string().trim().min(3, "Nama bisnis minimal 3 karakter"),
  description: z
    .string()
    .trim()
    .max(1000, "Deskripsi maksimal 1000 karakter")
    .optional()
    .or(z.literal("")),
  categoryId: z.string().trim().min(1, "Kategori wajib dipilih"),
  phoneNumber: z.string().trim().min(9, "Nomor telepon minimal 9 digit"),
  businessAddress: z.string().trim().min(5, "Alamat bisnis wajib diisi"),
  city: z.string().trim().min(2, "Kota wajib diisi"),
  province: z.string().trim().min(2, "Provinsi wajib diisi"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
