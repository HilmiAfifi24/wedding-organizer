import { MediaType } from "@wo/shared-types";
import { z } from "zod";

export const createPortfolioSchema = z.object({
  title: z.string().trim().max(120, "Judul maksimal 120 karakter").optional().or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(1000, "Deskripsi maksimal 1000 karakter")
    .optional()
    .or(z.literal("")),
  mediaUrl: z.string().trim().url("Media URL harus berupa URL valid"),
  mediaType: z.nativeEnum(MediaType),
});

export const portfolioIdParamSchema = z.object({
  id: z.string().min(1, "Portfolio id is required"),
});

export type CreatePortfolioInputSchema = z.infer<typeof createPortfolioSchema>;
