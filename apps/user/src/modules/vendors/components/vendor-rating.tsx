import { cn } from "@wo/ui-components";

export function VendorRating({
  rating,
  totalReviews,
  className,
}: {
  rating: number;
  totalReviews: number;
  className?: string;
}) {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <div className={cn("flex items-center gap-2 text-sm text-slate-600", className)}>
      <span className="text-amber-500">{`${"★".repeat(safeRating)}${"☆".repeat(5 - safeRating)}`}</span>
      <span>
        {rating.toFixed(1)} ({totalReviews} review)
      </span>
    </div>
  );
}
