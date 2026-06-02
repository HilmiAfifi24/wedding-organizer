import { PaymentProofStatus } from "@wo/shared-types";
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

export const vendorPaymentListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional().transform(normalizeText),
    paymentProofStatus: z.nativeEnum(PaymentProofStatus).optional(),
    customer: z.string().optional().transform(normalizeText),
    bookedFrom: optionalDateSchema,
    bookedTo: optionalDateSchema,
    uploadedFrom: optionalDateSchema,
    uploadedTo: optionalDateSchema,
    sortBy: z.enum(["bookedAt", "createdAt", "updatedAt", "status"]).default("createdAt"),
    sortDirection: z.enum(["asc", "desc"]).default("desc"),
  })
  .transform((value) => ({
    ...value,
    bookedFrom: value.bookedFrom ? dateStart(value.bookedFrom) : undefined,
    bookedTo: value.bookedTo ? dateEnd(value.bookedTo) : undefined,
    uploadedFrom: value.uploadedFrom ? dateStart(value.uploadedFrom) : undefined,
    uploadedTo: value.uploadedTo ? dateEnd(value.uploadedTo) : undefined,
  }))
  .superRefine((value, ctx) => {
    if (value.bookedFrom && value.bookedTo && value.bookedFrom > value.bookedTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "`bookedFrom` must be earlier than or equal to `bookedTo`",
        path: ["bookedFrom"],
      });
    }

    if (value.uploadedFrom && value.uploadedTo && value.uploadedFrom > value.uploadedTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "`uploadedFrom` must be earlier than or equal to `uploadedTo`",
        path: ["uploadedFrom"],
      });
    }
  });

export const verifyPaymentProofBodySchema = z.object({
  verificationNote: z
    .string()
    .max(500)
    .optional()
    .transform((value) => normalizeText(value)),
});

export const rejectPaymentProofBodySchema = z.object({
  reason: z.string().trim().min(3).max(500),
});

export type VendorPaymentListQueryInput = z.infer<typeof vendorPaymentListQuerySchema>;
