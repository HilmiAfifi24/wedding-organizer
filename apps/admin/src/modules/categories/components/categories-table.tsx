"use client";

import type { AdminCategoryListItemDTO } from "@wo/shared-types";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@wo/ui-components";

interface CategoriesTableProps {
  items: AdminCategoryListItemDTO[];
  isLoading: boolean;
  isActionLoading: boolean;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (category: AdminCategoryListItemDTO) => void;
  onDelete: (category: AdminCategoryListItemDTO) => void;
}

export const CategoriesTable = ({
  items,
  isLoading,
  isActionLoading,
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
}: CategoriesTableProps) => {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border/60 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Kategori</TableHead>
              <TableHead>Dipakai Vendor</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead>Diubah</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Memuat data kategori...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Tidak ada kategori vendor.
                </TableCell>
              </TableRow>
            ) : (
              items.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.vendorCount}</TableCell>
                  <TableCell>{category.createdAt.toLocaleString("id-ID")}</TableCell>
                  <TableCell>{category.updatedAt.toLocaleString("id-ID")}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(category)}
                        disabled={isActionLoading}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-danger"
                        onClick={() => onDelete(category)}
                        disabled={isActionLoading}
                      >
                        Hapus
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
          Menampilkan {items.length} dari {totalItems} kategori
        </p>

        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-2 focus:ring-offset-background"
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
