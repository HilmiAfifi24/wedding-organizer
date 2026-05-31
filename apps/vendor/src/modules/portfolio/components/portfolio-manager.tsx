"use client";

import { useMemo, useState } from "react";
import { MediaType, type PortfolioDTO, type VendorStatus } from "@wo/shared-types";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
} from "@wo/ui-components";

import { vendorPortfolioApi } from "../portfolio-api";

type AppToast = {
  id: string;
  title: string;
  description: string;
  tone: "success" | "error";
};

const normalizePortfolio = (portfolio: PortfolioDTO): PortfolioDTO => ({
  ...portfolio,
  createdAt: new Date(portfolio.createdAt),
  updatedAt: new Date(portfolio.updatedAt),
});

interface PortfolioManagerProps {
  initialPortfolio: PortfolioDTO[];
  vendorStatus: VendorStatus;
}

export function PortfolioManager({ initialPortfolio, vendorStatus }: PortfolioManagerProps) {
  const [items, setItems] = useState<PortfolioDTO[]>(initialPortfolio.map(normalizePortfolio));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>(MediaType.IMAGE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<AppToast[]>([]);

  const addToast = (toast: Omit<AppToast, "id">) => {
    setToasts((current) => [
      ...current,
      {
        ...toast,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
    ]);
  };

  const dismissToast = (id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const isOnboardingState = vendorStatus !== "approved";

  const portfolioCountText = useMemo(
    () =>
      items.length > 0
        ? `${items.length} item portfolio sudah tersedia.`
        : "Belum ada portfolio. Tambahkan minimal 1 item untuk checklist approval.",
    [items.length]
  );

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setMediaUrl("");
    setMediaType(MediaType.IMAGE);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const created = await vendorPortfolioApi.create({
        title: title || undefined,
        description: description || undefined,
        mediaUrl,
        mediaType,
      });

      setItems((current) => [normalizePortfolio(created), ...current]);
      addToast({
        title: "Portfolio ditambahkan",
        description: "Item portfolio berhasil ditambahkan.",
        tone: "success",
      });
      resetForm();
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Portfolio gagal disimpan.";
      setError(message);
      addToast({
        title: "Aksi gagal",
        description: message,
        tone: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (portfolioId: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await vendorPortfolioApi.remove(portfolioId);
      setItems((current) => current.filter((item) => item.id !== portfolioId));
      addToast({
        title: "Portfolio dihapus",
        description: "Item portfolio berhasil dihapus.",
        tone: "success",
      });
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "Portfolio gagal dihapus.";
      setError(message);
      addToast({
        title: "Hapus gagal",
        description: message,
        tone: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-white/10 bg-slate-950/65 text-slate-100 backdrop-blur">
        <CardHeader>
          <CardTitle>Tambah Portfolio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isOnboardingState ? (
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
              Vendor onboarding membutuhkan minimal 1 portfolio agar approval admin bisa
              dilanjutkan.
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Judul</label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="border-white/10 bg-slate-900 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Media Type</label>
              <select
                value={mediaType}
                onChange={(event) => setMediaType(event.target.value as MediaType)}
                className="flex h-10 w-full rounded-md border border-white/10 bg-slate-900 px-3 text-sm text-slate-100"
              >
                <option value={MediaType.IMAGE}>IMAGE</option>
                <option value={MediaType.VIDEO}>VIDEO</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-200">Media URL</label>
              <Input
                value={mediaUrl}
                onChange={(event) => setMediaUrl(event.target.value)}
                className="border-white/10 bg-slate-900 text-slate-100"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-200">Deskripsi</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                className="flex w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              />
            </div>
          </div>

          <Button onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Tambah Portfolio"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-white/10 bg-slate-950/65 text-slate-100 backdrop-blur">
        <CardHeader>
          <CardTitle>Daftar Portfolio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-400">{portfolioCountText}</p>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
              Belum ada item portfolio vendor.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 lg:flex-row lg:items-start lg:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-white">
                        {item.title || "Untitled Portfolio"}
                      </p>
                      <span className="rounded-full bg-cyan-400/10 px-2 py-1 text-xs font-medium text-cyan-300">
                        {item.mediaType}
                      </span>
                    </div>
                    <p className="break-all text-sm text-cyan-200">{item.mediaUrl}</p>
                    <p className="text-sm leading-6 text-slate-400">
                      {item.description || "Belum ada deskripsi portfolio."}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-300"
                    onClick={() => void handleDelete(item.id)}
                    disabled={isSubmitting}
                  >
                    Hapus
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            className={
              toast.tone === "success"
                ? "pointer-events-auto border-emerald-500/30 bg-emerald-500/10"
                : "pointer-events-auto border-rose-500/30 bg-rose-500/10"
            }
          >
            <div className="grid gap-1">
              <ToastTitle>{toast.title}</ToastTitle>
              <ToastDescription>{toast.description}</ToastDescription>
            </div>
            <ToastClose onClick={() => dismissToast(toast.id)} />
          </Toast>
        ))}
      </div>
    </div>
  );
}
