import { ReviewStatus } from "@wo/shared-types";
import { z } from "zod";

const normalizeText = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const dateStart = (value: string) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const dateEnd = (value: string) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

const optionalDateSchema = z
  .string()
  .optional()
  .transform((value, ctx) => {
    const trimmed = normalizeText(value);
    if (!trimmed) {
      return undefined;
    }

    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid date format",
      });
      return z.NEVER;
    }

    return trimmed;
  });

export const reviewIdParamSchema = z.object({
  id: z.string().min(1, "Review id is required"),
});

export const reviewListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional().transform(normalizeText),
    status: z.nativeEnum(ReviewStatus).optional(),
    rating: z.coerce.number().int().min(1).max(5).optional(),
    vendor: z.string().optional().transform(normalizeText),
    createdFrom: optionalDateSchema,
    createdTo: optionalDateSchema,
    sortBy: z.enum(["createdAt", "updatedAt", "rating", "status"]).default("createdAt"),
    sortDirection: z.enum(["asc", "desc"]).default("desc"),
  })
  .transform((value) => ({
    ...value,
    createdFrom: value.createdFrom ? dateStart(value.createdFrom) : undefined,
    createdTo: value.createdTo ? dateEnd(value.createdTo) : undefined,
  }))
  .superRefine((value, ctx) => {
    if (value.createdFrom && value.createdTo && value.createdFrom > value.createdTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "`createdFrom` must be earlier than or equal to `createdTo`",
        path: ["createdFrom"],
      });
    }
  });

export const moderationReasonBodySchema = z.object({
  reason: z.string().trim().min(3).max(500),
});

export const unhideReviewBodySchema = z.object({
  reason: z
    .string()
    .max(500)
    .optional()
    .transform((value) => {
      if (!value) {
        return undefined;
      }

      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }),
});

export type ReviewListQueryInput = z.infer<typeof reviewListQuerySchema>;
