"use client";

import Link from "next/link";

import type { AdminReviewListItemDTO } from "@wo/shared-types";
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@wo/ui-components";

import { formatRatingStars, getReviewStatusBadgeVariant } from "../constants";

type ReviewsTableProps = {
  items: AdminReviewListItemDTO[];
  isLoading: boolean;
  isActionLoading: boolean;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onHide: (review: AdminReviewListItemDTO) => void;
  onUnhide: (review: AdminReviewListItemDTO) => void;
  onDelete: (review: AdminReviewListItemDTO) => void;
};

const formatDateTime = (value: Date | string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const ReviewsTable = ({
  items,
  isLoading,
  isActionLoading,
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onHide,
  onUnhide,
  onDelete,
}: ReviewsTableProps) => {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border/60 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reviewer</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Memuat review...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Tidak ada review.
                </TableCell>
              </TableRow>
            ) : (
              items.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <p className="font-medium">{review.reviewerName || "-"}</p>
                    <p className="text-xs text-muted-foreground">{review.reviewerEmail}</p>
                  </TableCell>
                  <TableCell>{review.vendorName}</TableCell>
                  <TableCell>
                    <p className="font-medium">{formatRatingStars(review.rating)}</p>
                    <p className="text-xs text-muted-foreground">{review.rating}/5</p>
                  </TableCell>
                  <TableCell className="max-w-[280px] truncate">{review.comment || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={getReviewStatusBadgeVariant(review.status)}>{review.status}</Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(review.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/reviews/${review.id}`}>Detail</Link>
                      </Button>

                      {review.status === "HIDDEN" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onUnhide(review)}
                          disabled={isActionLoading}
                        >
                          Unhide
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onHide(review)}
                          disabled={isActionLoading || review.status === "DELETED"}
                        >
                          Hide
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-danger"
                        onClick={() => onDelete(review)}
                        disabled={isActionLoading || review.status === "DELETED"}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          Menampilkan {items.length} dari {totalItems} review
        </p>

        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-md border border-border bg-transparent px-2 text-sm"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} / halaman
              </option>
            ))}
          </select>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
          >
            Prev
          </Button>
          <span className="px-2 text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
