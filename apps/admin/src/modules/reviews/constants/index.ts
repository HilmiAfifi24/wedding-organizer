import { ReviewStatus } from "@wo/shared-types";

export const REVIEW_STATUS_FILTER_OPTIONS = [
  { label: "Semua Status", value: "ALL" },
  { label: "Visible", value: ReviewStatus.VISIBLE },
  { label: "Hidden", value: ReviewStatus.HIDDEN },
  { label: "Deleted", value: ReviewStatus.DELETED },
] as const;

export const REVIEW_RATING_FILTER_OPTIONS = [
  { label: "Semua Rating", value: "ALL" },
  { label: "5 Bintang", value: "5" },
  { label: "4 Bintang", value: "4" },
  { label: "3 Bintang", value: "3" },
  { label: "2 Bintang", value: "2" },
  { label: "1 Bintang", value: "1" },
] as const;

export const REVIEW_SORT_OPTIONS = [
  { label: "Created At", value: "createdAt" },
  { label: "Updated At", value: "updatedAt" },
  { label: "Rating", value: "rating" },
  { label: "Status", value: "status" },
] as const;

export const getReviewStatusBadgeVariant = (status: ReviewStatus) => {
  switch (status) {
    case ReviewStatus.VISIBLE:
      return "success" as const;
    case ReviewStatus.HIDDEN:
      return "warning" as const;
    case ReviewStatus.DELETED:
      return "danger" as const;
    default:
      return "outline" as const;
  }
};

export const formatRatingStars = (rating: number) =>
  `${"★".repeat(Math.max(0, rating))}${"☆".repeat(Math.max(0, 5 - rating))}`;
