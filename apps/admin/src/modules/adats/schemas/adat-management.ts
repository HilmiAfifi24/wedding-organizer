import { z } from "zod";

export const adatIdParamSchema = z.object({
  id: z.string().min(1, "Adat id is required"),
});

export const adatListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }),
  sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("name"),
  sortDirection: z.enum(["asc", "desc"]).default("asc"),
});

export const createAdatBodySchema = z.object({
  name: z.string().trim().min(2, "Nama adat minimal 2 karakter").max(100),
});

export const updateAdatBodySchema = z.object({
  name: z.string().trim().min(2, "Nama adat minimal 2 karakter").max(100),
});
