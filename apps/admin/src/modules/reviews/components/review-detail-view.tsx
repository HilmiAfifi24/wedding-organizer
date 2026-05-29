"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { AdminReviewDetailDTO, ReviewModerationHistoryDTO } from "@wo/shared-types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";

import { formatRatingStars, getReviewStatusBadgeVariant } from "../constants";
import { reviewsApi } from "../services/reviews-api";
import { ReviewHistoryTimeline } from "./review-history-timeline";

type ReviewDetailViewProps = {
  reviewId: string;
};

const formatDateTime = (value: Date | string | null | undefined) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const ReviewDetailView = ({ reviewId }: ReviewDetailViewProps) => {
  const [review, setReview] = useState<AdminReviewDetailDTO | null>(null);
  const [history, setHistory] = useState<ReviewModerationHistoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await reviewsApi.detail(reviewId);
        if (!isMounted) {
          return;
        }

        setReview(response);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Gagal memuat detail review");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDetail();

    return () => {
      isMounted = false;
    };
  }, [reviewId]);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      setIsHistoryLoading(true);
      setHistoryError(null);

      try {
        const response = await reviewsApi.history(reviewId);
        if (!isMounted) {
          return;
        }

        setHistory(response);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setHistoryError(
          loadError instanceof Error ? loadError.message : "Gagal memuat riwayat moderasi"
        );
      } finally {
        if (isMounted) {
          setIsHistoryLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, [reviewId]);

  if (isLoading) {
    return (
      <div className="rounded-md border border-border/60 px-4 py-6 text-sm text-muted-foreground">
        Memuat detail review...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
        <Button variant="outline" asChild>
          <Link href="/reviews">Kembali ke daftar review</Link>
        </Button>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="rounded-md border border-border/60 px-4 py-6 text-sm text-muted-foreground">
        Data review tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Detail Review</h1>
          <p className="text-sm text-muted-foreground">
            Review ID: <span className="font-mono">{review.id}</span>
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/reviews">Kembali</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge variant={getReviewStatusBadgeVariant(review.status)}>{review.status}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Rating</p>
            <p className="font-medium">
              {formatRatingStars(review.rating)} ({review.rating}/5)
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Created At</p>
            <p className="font-medium">{formatDateTime(review.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Updated At</p>
            <p className="font-medium">{formatDateTime(review.updatedAt)}</p>
          </div>
          <div className="md:col-span-2 xl:col-span-4">
            <p className="text-xs text-muted-foreground">Isi Review</p>
            <p className="font-medium">{review.comment || "-"}</p>
          </div>
          <div className="md:col-span-2 xl:col-span-4">
            <p className="text-xs text-muted-foreground">Moderation Reason</p>
            <p className="font-medium">{review.moderationReason || "-"}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Related Booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Booking ID</p>
              <p className="font-medium">{review.booking.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status Booking</p>
              <p className="font-medium">{review.booking.status}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Booking Date</p>
              <p className="font-medium">{formatDateTime(review.booking.bookedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Service</p>
              <p className="font-medium">{review.booking.serviceName || "-"}</p>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/bookings/${review.booking.id}`}>Lihat Detail Booking</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Nama</p>
              <p className="font-medium">{review.user.name || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{review.user.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="font-medium">{review.user.role}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related Vendor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Vendor</p>
              <p className="font-medium">{review.vendor.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status Vendor</p>
              <p className="font-medium">{review.vendor.status}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Owner</p>
              <p className="font-medium">{review.vendor.ownerName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Owner Email</p>
              <p className="font-medium">{review.vendor.ownerEmail || "-"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Moderation Metadata</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Hidden At</p>
            <p className="font-medium">{formatDateTime(review.hiddenAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Hidden By</p>
            <p className="font-medium">{review.hiddenByName || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Deleted At</p>
            <p className="font-medium">{formatDateTime(review.deletedAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Deleted By</p>
            <p className="font-medium">{review.deletedByName || "-"}</p>
          </div>
        </CardContent>
      </Card>

      <ReviewHistoryTimeline
        createdAt={review.createdAt}
        items={history}
        isLoading={isHistoryLoading}
        error={historyError}
      />
    </div>
  );
};
