import { BookingStatus, PaymentProofStatus } from "@wo/shared-types";
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

export const paymentProofIdParamSchema = z.object({
  id: z.string().min(1, "Payment proof id is required"),
});

export const paymentProofListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional().transform(normalizeText),
    paymentProofStatus: z.nativeEnum(PaymentProofStatus).optional(),
    bookingStatus: z.nativeEnum(BookingStatus).optional(),
    vendor: z.string().optional().transform(normalizeText),
    uploadedFrom: optionalDateSchema,
    uploadedTo: optionalDateSchema,
    sortBy: z.enum(["createdAt", "updatedAt", "status", "verifiedAt"]).default("createdAt"),
    sortDirection: z.enum(["asc", "desc"]).default("desc"),
  })
  .transform((value) => ({
    ...value,
    uploadedFrom: value.uploadedFrom ? dateStart(value.uploadedFrom) : undefined,
    uploadedTo: value.uploadedTo ? dateEnd(value.uploadedTo) : undefined,
  }))
  .superRefine((value, ctx) => {
    if (value.uploadedFrom && value.uploadedTo && value.uploadedFrom > value.uploadedTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "`uploadedFrom` must be earlier than or equal to `uploadedTo`",
        path: ["uploadedFrom"],
      });
    }
  });

export const paymentOverrideBodySchema = z.object({
  reason: z.string().trim().min(3).max(500),
});

export type PaymentProofListQueryInput = z.infer<typeof paymentProofListQuerySchema>;
