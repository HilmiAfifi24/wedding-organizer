import { z } from "zod";

import { VENDOR_DISCOVERY_PAGE_SIZE } from "../constants";

export const vendorDiscoveryQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(24).default(VENDOR_DISCOVERY_PAGE_SIZE),
    search: z.string().trim().max(120).optional().or(z.literal("")),
    categoryId: z.string().trim().optional().or(z.literal("")),
    city: z.string().trim().optional().or(z.literal("")),
    priceMin: z.coerce.number().int().min(0).optional(),
    priceMax: z.coerce.number().int().min(0).optional(),
    rating: z.coerce.number().int().min(1).max(5).optional(),
    sortBy: z
      .enum([
        "newest",
        "highest-rating",
        "most-booked",
        "price-low-to-high",
        "price-high-to-low",
      ])
      .default("newest"),
  })
  .transform((input) => ({
    ...input,
    search: input.search || undefined,
    categoryId: input.categoryId || undefined,
    city: input.city || undefined,
  }))
  .refine(
    (input) =>
      input.priceMin === undefined ||
      input.priceMax === undefined ||
      input.priceMax >= input.priceMin,
    {
      message: "Rentang harga tidak valid",
      path: ["priceMax"],
    }
  );

export type VendorDiscoveryQuery = z.infer<typeof vendorDiscoveryQuerySchema>;
