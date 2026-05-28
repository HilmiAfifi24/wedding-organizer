import { VendorStatus } from "@wo/shared-types";
import { z } from "zod";

export const vendorIdParamSchema = z.object({
  id: z.string().min(1, "Vendor id is required"),
});

export const vendorListQuerySchema = z.object({
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
  status: z.nativeEnum(VendorStatus).optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "name"]).default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
  includeDeleted: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((value) => value === true || value === "true"),
});

export const vendorDetailQuerySchema = z.object({
  includeHistory: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((value) => value === true || value === "true"),
  includeDeleted: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((value) => value === true || value === "true"),
});

export const rejectVendorBodySchema = z.object({
  reason: z.string().trim().min(3).max(255),
});

export type VendorListQueryInput = z.infer<typeof vendorListQuerySchema>;
export type VendorDetailQueryInput = z.infer<typeof vendorDetailQuerySchema>;
