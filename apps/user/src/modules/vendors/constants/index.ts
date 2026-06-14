import type { PublicVendorSortOption } from "@/core/domain/repositories";

export const VENDOR_DISCOVERY_PAGE_SIZE = 9;

export const VENDOR_SORT_OPTIONS: Array<{ value: PublicVendorSortOption; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "highest-rating", label: "Highest Rating" },
  { value: "most-booked", label: "Most Booked" },
  { value: "price-low-to-high", label: "Price Low to High" },
  { value: "price-high-to-low", label: "Price High to Low" },
];

export const RATING_FILTER_OPTIONS = [
  { value: "", label: "All Ratings" },
  { value: "5", label: "5 stars" },
  { value: "4", label: "4 stars & up" },
  { value: "3", label: "3 stars & up" },
];

export const formatPrice = (price: number | null) => {
  if (price === null) {
    return "Hubungi vendor";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatRatingLabel = (rating: number, totalReviews: number) =>
  `${rating.toFixed(1)} / 5 (${totalReviews} review)`;
