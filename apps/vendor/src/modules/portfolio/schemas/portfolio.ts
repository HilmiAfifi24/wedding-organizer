import { MediaType } from "@wo/shared-types";
import { z } from "zod";

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

export const createPortfolioSchema = z.object({
  title: z.string().trim().max(120, "Judul maksimal 120 karakter").optional().or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(1000, "Deskripsi maksimal 1000 karakter")
    .optional()
    .or(z.literal("")),
  mediaUrl: mediaUrlSchema,
  mediaType: z.nativeEnum(MediaType),
});

export const updatePortfolioSchema = z.object({
  title: z.string().trim().max(120, "Judul maksimal 120 karakter").optional().or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(1000, "Deskripsi maksimal 1000 karakter")
    .optional()
    .or(z.literal("")),
  mediaUrl: mediaUrlSchema.optional(),
  mediaType: z.nativeEnum(MediaType).optional(),
});

export const portfolioIdParamSchema = z.object({
  id: z.string().min(1, "Portfolio id is required"),
});

export type CreatePortfolioInputSchema = z.infer<typeof createPortfolioSchema>;
export type UpdatePortfolioInputSchema = z.infer<typeof updatePortfolioSchema>;
