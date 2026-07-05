import { Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";

import type { PublicVendorReviewItemDTO } from "../types";
import { VendorRating } from "./vendor-rating";

export function VendorReviewsSection({
  reviews,
  averageRating,
  totalReviews,
}: {
  reviews: PublicVendorReviewItemDTO[];
  averageRating: number;
  totalReviews: number;
}) {
  return (
    <Card className="rounded-[28px] border-white/10 bg-card shadow-2xl">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl text-white">Reviews</CardTitle>
        <VendorRating rating={averageRating} totalReviews={totalReviews} />
      </CardHeader>
      <CardContent>
        {reviews.length ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-white">{review.reviewerName || "Customer"}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {review.createdAt.toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-amber-500">
                    {`${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}`}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {review.comment || "Reviewer tidak menambahkan komentar tertulis."}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
            Belum ada review publik untuk vendor ini.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
