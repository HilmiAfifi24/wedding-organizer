import { Role, UserStatus } from "@wo/shared-types";
import { z } from "zod";

export const userIdParamSchema = z.object({
  id: z.string().min(1, "User id is required"),
});

export const userListQuerySchema = z.object({
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
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "name", "email"]).default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
  includeDeleted: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((value) => value === true || value === "true"),
});

export const userDetailQuerySchema = z.object({
  includeHistory: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((value) => value === true || value === "true"),
  includeDeleted: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((value) => value === true || value === "true"),
});

export const suspendUserBodySchema = z.object({
  reason: z.string().max(255).optional(),
});

export const unsuspendUserBodySchema = z.object({
  reason: z.string().max(255).optional(),
});

export type UserListQueryInput = z.infer<typeof userListQuerySchema>;
export type UserDetailQueryInput = z.infer<typeof userDetailQuerySchema>;
