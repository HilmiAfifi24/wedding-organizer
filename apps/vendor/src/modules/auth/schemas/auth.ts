import { z } from "zod";

const normalizeText = (value: string) => value.trim();

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid").transform(normalizeText),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z
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
