import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().trim().min(2, "Nama layanan minimal 2 karakter"),
  description: z
    .string()
    .trim()
    .max(1000, "Deskripsi maksimal 1000 karakter")
    .optional()
    .or(z.literal("")),
  price: z.coerce.number().int().min(0, "Harga layanan tidak valid"),
  isActive: z.boolean().optional().default(true),
});

export const updateServiceSchema = z.object({
  name: z.string().trim().min(2, "Nama layanan minimal 2 karakter").optional(),
  description: z
    .string()
    .trim()
    .max(1000, "Deskripsi maksimal 1000 karakter")
    .optional()
    .or(z.literal("")),
  price: z.coerce.number().int().min(0, "Harga layanan tidak valid").optional(),
  isActive: z.boolean().optional(),
});

export const serviceIdParamSchema = z.object({
  id: z.string().min(1, "Service id is required"),
});

export type CreateServiceInputSchema = z.infer<typeof createServiceSchema>;
export type UpdateServiceInputSchema = z.infer<typeof updateServiceSchema>;
