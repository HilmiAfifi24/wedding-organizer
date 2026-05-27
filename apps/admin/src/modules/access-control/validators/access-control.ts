import { z } from "zod";

const nullableTrimmedString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value !== "string") return value ?? undefined;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  });

export const createAccessMenuSchema = z.object({
  code: z.string().trim().min(1, "Code is required"),
  name: z.string().trim().min(1, "Name is required"),
  path: nullableTrimmedString,
  icon: nullableTrimmedString,
  parentId: nullableTrimmedString,
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().optional(),
});

export const updateAccessMenuSchema = z
  .object({
    code: z.string().trim().min(1).optional(),
    name: z.string().trim().min(1).optional(),
    path: z.union([z.string().trim(), z.null()]).optional(),
    icon: z.union([z.string().trim(), z.null()]).optional(),
    parentId: z.union([z.string().trim(), z.null()]).optional(),
    sortOrder: z.coerce.number().int().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export const createAccessProfileSchema = z.object({
  code: z.string().trim().min(1, "Code is required"),
  name: z.string().trim().min(1, "Name is required"),
  description: z.union([z.string(), z.undefined()]).transform((value) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }),
  isSystem: z.boolean().optional(),
});

export const updateAccessProfileSchema = z
  .object({
    code: z.string().trim().min(1).optional(),
    name: z.string().trim().min(1).optional(),
    description: z.union([z.string(), z.null()]).optional(),
    isSystem: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export const setAccessPermissionSchema = z.object({
  accessMenuId: z.string().trim().min(1),
  canView: z.boolean().optional(),
  canInsert: z.boolean().optional(),
  canUpdate: z.boolean().optional(),
  canUpsert: z.boolean().optional(),
  canDelete: z.boolean().optional(),
  canHistory: z.boolean().optional(),
  customEvents: z.array(z.string()).optional(),
});

export const setAccessPermissionsPayloadSchema = z.union([
  z.array(setAccessPermissionSchema),
  z.object({ permissions: z.array(setAccessPermissionSchema) }),
]);
