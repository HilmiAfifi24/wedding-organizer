import type { VendorDiscoveryQuery } from "../schemas/vendor-discovery";

export const buildVendorDiscoveryQueryString = (
  current: Partial<VendorDiscoveryQuery>,
  overrides: Partial<VendorDiscoveryQuery> = {}
) => {
  const query = new URLSearchParams();
  const merged = {
    ...current,
    ...overrides,
  };

  if (merged.page && merged.page > 1) {
    query.set("page", String(merged.page));
  }

  if (merged.pageSize) {
    query.set("pageSize", String(merged.pageSize));
  }

  if (merged.search?.trim()) {
    query.set("search", merged.search.trim());
  }

  if (merged.categoryId?.trim()) {
    query.set("categoryId", merged.categoryId.trim());
  }

  if (merged.city?.trim()) {
    query.set("city", merged.city.trim());
  }

  if (typeof merged.priceMin === "number") {
    query.set("priceMin", String(merged.priceMin));
  }

  if (typeof merged.priceMax === "number") {
    query.set("priceMax", String(merged.priceMax));
  }

  if (typeof merged.rating === "number") {
    query.set("rating", String(merged.rating));
  }

  if (merged.sortBy && merged.sortBy !== "newest") {
    query.set("sortBy", merged.sortBy);
  }

  return query.toString();
};
