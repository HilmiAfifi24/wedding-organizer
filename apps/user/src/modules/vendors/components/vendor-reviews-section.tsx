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
    <Card className="rounded-[28px] border-white/80 bg-white/88 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl text-slate-950">Reviews</CardTitle>
        <VendorRating rating={averageRating} totalReviews={totalReviews} />
      </CardHeader>
      <CardContent>
        {reviews.length ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-3xl border border-slate-100 bg-slate-50/90 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{review.reviewerName || "Customer"}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {review.createdAt.toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-amber-500">
                    {`${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}`}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {review.comment || "Reviewer tidak menambahkan komentar tertulis."}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-sm text-slate-600">
            Belum ada review publik untuk vendor ini.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
