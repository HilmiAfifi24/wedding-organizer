import type {
  PublicVendorListItemDTO,
  PublicVendorReviewItemDTO,
  PublicVendorSortOption,
  PublicVendorServiceItemDTO,
} from "../repositories/public-vendor-repository";

export const getVendorDisplayName = (input: {
  businessName?: string | null;
  name: string;
}) => input.businessName?.trim() || input.name.trim();

export const calculateAverageRating = (
  reviews: Array<Pick<PublicVendorReviewItemDTO, "rating">> | Array<{ rating: number }>
) => {
  if (!reviews.length) {
    return 0;
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Number((total / reviews.length).toFixed(1));
};

export const calculateStartingPrice = (
  services: Array<Pick<PublicVendorServiceItemDTO, "price">> | Array<{ price: number }>
) => {
  if (!services.length) {
    return null;
  }

  return Math.min(...services.map((service) => service.price));
};

export const getVendorShortDescription = (description?: string | null) => {
  const normalized = description?.trim();

  if (!normalized) {
    return "Vendor ini siap membantu Anda menyiapkan momen pernikahan yang lebih terarah dan berkesan.";
  }

  if (normalized.length <= 160) {
    return normalized;
  }

  return `${normalized.slice(0, 157)}...`;
};

export const sortPublicVendors = (
  items: PublicVendorListItemDTO[],
  sortBy: PublicVendorSortOption
) => {
  const copy = [...items];

  copy.sort((left, right) => {
    if (sortBy === "highest-rating") {
      return (
        right.averageRating - left.averageRating ||
        right.totalReviews - left.totalReviews ||
        right.createdAt.getTime() - left.createdAt.getTime()
      );
    }

    if (sortBy === "most-booked") {
      return (
        right.bookingCount - left.bookingCount ||
        right.averageRating - left.averageRating ||
        right.createdAt.getTime() - left.createdAt.getTime()
      );
    }

    if (sortBy === "price-low-to-high") {
      if (left.startingPrice === null && right.startingPrice === null) {
        return right.createdAt.getTime() - left.createdAt.getTime();
      }

      if (left.startingPrice === null) {
        return 1;
      }

      if (right.startingPrice === null) {
        return -1;
      }

      return (
        left.startingPrice - right.startingPrice ||
        right.averageRating - left.averageRating ||
        right.createdAt.getTime() - left.createdAt.getTime()
      );
    }

    if (sortBy === "price-high-to-low") {
      if (left.startingPrice === null && right.startingPrice === null) {
        return right.createdAt.getTime() - left.createdAt.getTime();
      }

      if (left.startingPrice === null) {
        return 1;
      }

      if (right.startingPrice === null) {
        return -1;
      }

      return (
        right.startingPrice - left.startingPrice ||
        right.averageRating - left.averageRating ||
        right.createdAt.getTime() - left.createdAt.getTime()
      );
    }

    return right.createdAt.getTime() - left.createdAt.getTime();
  });

  return copy;
};
