import { z } from "zod";

export const categoryIdParamSchema = z.object({
  id: z.string().min(1, "Category id is required"),
});

export const categoryListQuerySchema = z.object({
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

export const createCategoryBodySchema = z.object({
  name: z.string().trim().min(2, "Nama kategori minimal 2 karakter").max(100),
});

export const updateCategoryBodySchema = z.object({
  name: z.string().trim().min(2, "Nama kategori minimal 2 karakter").max(100),
});
