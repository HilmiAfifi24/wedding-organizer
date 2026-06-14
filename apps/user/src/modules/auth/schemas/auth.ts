import { INDONESIAN_PHONE_REGEX } from "@wo/shared-types";
import { z } from "zod";

const normalizeText = (value: string) => value.trim();

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid").transform(normalizeText),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Nama lengkap minimal 2 karakter"),
    email: z.string().email("Format email tidak valid").transform(normalizeText),
    phoneNumber: z
      .string()
      .trim()
      .regex(
        INDONESIAN_PHONE_REGEX,
        "Nomor telepon harus menggunakan format Indonesia yang valid"
      ),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid").transform(normalizeText),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
