"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { AdminVendorDetailDTO } from "@wo/shared-types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@wo/ui-components";

import { vendorsApi } from "../services/vendors-api";

type VendorDetailViewProps = {
  vendorId: string;
};

const statusVariant = (status: AdminVendorDetailDTO["status"]) => {
  switch (status) {
    case "approved":
      return "success" as const;
    case "pending_verification":
      return "warning" as const;
    case "rejected":
      return "danger" as const;
    default:
      return "outline" as const;
  }
};

const boolLabel = (value: boolean) => (value ? "OK" : "Belum");

const dateText = (value: Date | string | null | undefined) => {
  if (!value) {
    return "-";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const VendorDetailView = ({ vendorId }: VendorDetailViewProps) => {
  const [vendor, setVendor] = useState<AdminVendorDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await vendorsApi.detail(vendorId, {
          includeHistory: true,
          includeDeleted: true,
        });

        if (!isMounted) {
          return;
        }

        setVendor(response);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Gagal memuat detail vendor");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [vendorId]);

  if (isLoading) {
    return (
      <div className="rounded-md border border-border/60 px-4 py-6 text-sm text-muted-foreground">
        Memuat detail vendor...
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
          <Link href="/vendors">Kembali ke daftar vendor</Link>
        </Button>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="rounded-md border border-border/60 px-4 py-6 text-sm text-muted-foreground">
        Data vendor tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Detail Vendor</h1>
        <Button variant="outline" asChild>
          <Link href="/vendors">Kembali</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil Vendor</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Nama Bisnis</p>
            <p className="font-medium">{vendor.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge variant={statusVariant(vendor.status)}>{vendor.status}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Kategori</p>
            <p className="font-medium">{vendor.categoryName || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="font-medium">{vendor.phoneNumber || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Lokasi</p>
            <p className="font-medium">{vendor.location || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Contact Info</p>
            <p className="font-medium">{vendor.contactInfo || "-"}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-muted-foreground">Deskripsi</p>
            <p className="font-medium">{vendor.description || "-"}</p>
          </div>
          {vendor.rejectionReason ? (
            <div className="md:col-span-2">
              <p className="text-xs text-muted-foreground">Alasan Rejected</p>
              <p className="font-medium text-danger">{vendor.rejectionReason}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Owner</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Nama</p>
            <p className="font-medium">{vendor.ownerName || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="font-medium">{vendor.ownerEmail}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Checklist Verifikasi</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          <p>Business Name: {boolLabel(vendor.checklist.businessNameExists)}</p>
          <p>Category: {boolLabel(vendor.checklist.categoryExists)}</p>
          <p>Phone Number: {boolLabel(vendor.checklist.phoneNumberValid)}</p>
          <p>Minimal 1 Service: {boolLabel(vendor.checklist.hasMinimumService)}</p>
          <p>Minimal 1 Portfolio: {boolLabel(vendor.checklist.hasMinimumPortfolio)}</p>
          <p className="font-semibold">Complete: {boolLabel(vendor.checklist.isComplete)}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Service Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[320px] overflow-auto rounded-md border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendor.services.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Belum ada service.
                      </TableCell>
                    </TableRow>
                  ) : (
                    vendor.services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>{service.name}</TableCell>
                        <TableCell>{service.price}</TableCell>
                        <TableCell>
                          <Badge variant={service.isActive ? "success" : "outline"}>
                            {service.isActive ? "active" : "inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[320px] overflow-auto rounded-md border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Media</TableHead>
                    <TableHead>URL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendor.portfolio.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Belum ada portfolio.
                      </TableCell>
                    </TableRow>
                  ) : (
                    vendor.portfolio.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.title || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.mediaType}</Badge>
                        </TableCell>
                        <TableCell>
                          <a href={item.mediaUrl} className="text-primary underline" target="_blank" rel="noreferrer">
                            Preview
                          </a>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Audit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[280px] overflow-auto rounded-md border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(vendor.history ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Belum ada audit log.
                    </TableCell>
                  </TableRow>
                ) : (
                  (vendor.history ?? []).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{dateText(log.createdAt)}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.actorId}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
