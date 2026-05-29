import { AuditModule } from "@wo/shared-types";
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

export const auditLogIdParamSchema = z.object({
  id: z.string().min(1, "Audit log id is required"),
});

export const auditLogListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional().transform(normalizeText),
    module: z.nativeEnum(AuditModule).optional(),
    action: z.string().optional().transform(normalizeText),
    actor: z.string().optional().transform(normalizeText),
    dateFrom: optionalDateSchema,
    dateTo: optionalDateSchema,
    sortBy: z.enum(["createdAt"]).default("createdAt"),
    sortDirection: z.enum(["asc", "desc"]).default("desc"),
  })
  .transform((value) => ({
    ...value,
    dateFrom: value.dateFrom ? dateStart(value.dateFrom) : undefined,
    dateTo: value.dateTo ? dateEnd(value.dateTo) : undefined,
  }))
  .superRefine((value, ctx) => {
    if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "`dateFrom` must be earlier than or equal to `dateTo`",
        path: ["dateFrom"],
      });
    }
  });

export type AuditLogListQueryInput = z.infer<typeof auditLogListQuerySchema>;
