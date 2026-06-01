"use client";
/* eslint-disable @next/next/no-img-element */

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

type PortfolioFormState = {
  mode: "create" | "edit";
  portfolioId?: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: MediaType;
};

type MediaFilter = "all" | MediaType.IMAGE | MediaType.VIDEO;

const normalizePortfolio = (portfolio: PortfolioDTO): PortfolioDTO => ({
  ...portfolio,
  createdAt: new Date(portfolio.createdAt),
  updatedAt: new Date(portfolio.updatedAt),
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

const createDefaultForm = (): PortfolioFormState => ({
  mode: "create",
  title: "",
  description: "",
  mediaUrl: "",
  mediaType: MediaType.IMAGE,
});

interface PortfolioManagerProps {
  initialPortfolio: PortfolioDTO[];
  vendorStatus: VendorStatus;
}

export function PortfolioManager({ initialPortfolio, vendorStatus }: PortfolioManagerProps) {
  const [items, setItems] = useState<PortfolioDTO[]>(initialPortfolio.map(normalizePortfolio));
  const [form, setForm] = useState<PortfolioFormState>(createDefaultForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<AppToast[]>([]);

  const addToast = (toast: Omit<AppToast, "id">) => {
    setToasts((current) => [
      ...current,
      { ...toast, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` },
    ]);
  };

  const dismissToast = (id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const isOnboardingState = vendorStatus !== "approved";

  const visibleItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return items
      .filter((item) => {
        if (mediaFilter !== "all" && item.mediaType !== mediaFilter) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        return [item.title ?? "", item.description ?? "", item.mediaUrl]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime());
  }, [items, mediaFilter, searchQuery]);

  const metrics = useMemo(() => {
    const imageCount = items.filter((item) => item.mediaType === MediaType.IMAGE).length;
    const videoCount = items.filter((item) => item.mediaType === MediaType.VIDEO).length;

    return {
      total: items.length,
      imageCount,
      videoCount,
    };
  }, [items]);

  const resetForm = () => {
    setForm(createDefaultForm());
    setError(null);
  };

  const validateForm = () => {
    if (!form.mediaUrl.trim()) {
      return "Media URL wajib diisi.";
    }

    try {
      new URL(form.mediaUrl.trim());
    } catch {
      return "Media URL harus berupa URL yang valid.";
    }

    if (!Object.values(MediaType).includes(form.mediaType)) {
      return "Media type tidak valid.";
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationMessage = validateForm();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: form.title.trim() || undefined,
        description: form.description.trim() || undefined,
        mediaUrl: form.mediaUrl.trim(),
        mediaType: form.mediaType,
      };

      if (form.mode === "create") {
        const created = await vendorPortfolioApi.create(payload);
        setItems((current) => [normalizePortfolio(created), ...current]);
        addToast({
          title: "Portfolio ditambahkan",
          description: "Item portfolio berhasil ditambahkan.",
          tone: "success",
        });
      } else if (form.portfolioId) {
        const updated = await vendorPortfolioApi.update(form.portfolioId, payload);
        setItems((current) =>
          current.map((item) => (item.id === updated.id ? normalizePortfolio(updated) : item))
        );
        addToast({
          title: "Portfolio diperbarui",
          description: "Item portfolio berhasil diperbarui.",
          tone: "success",
        });
      }

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

  const handleEdit = (item: PortfolioDTO) => {
    setError(null);
    setForm({
      mode: "edit",
      portfolioId: item.id,
      title: item.title ?? "",
      description: item.description ?? "",
      mediaUrl: item.mediaUrl,
      mediaType: item.mediaType,
    });
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

      if (form.portfolioId === portfolioId) {
        resetForm();
      }
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
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total Portfolio" value={`${metrics.total}`} accent="text-cyan-300" />
        <MetricCard label="Image Assets" value={`${metrics.imageCount}`} accent="text-emerald-300" />
        <MetricCard label="Video Assets" value={`${metrics.videoCount}`} accent="text-fuchsia-300" />
      </div>

      <Card className="border border-white/10 bg-slate-950/65 text-slate-100 backdrop-blur">
        <CardHeader>
          <CardTitle>{form.mode === "create" ? "Tambah Portfolio" : "Edit Portfolio"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isOnboardingState ? (
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
              Vendor onboarding membutuhkan minimal 1 portfolio agar approval admin bisa
              dilanjutkan.
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              Vendor sudah approved. Kelola portfolio agar storefront vendor terlihat lebih kuat
              dan meyakinkan calon pelanggan.
            </div>
          )}

          {error ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Judul</label>
              <Input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="Contoh: Wedding Makeup Session"
                className="border-white/10 bg-slate-900 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Media Type</label>
              <select
                value={form.mediaType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    mediaType: event.target.value as MediaType,
                  }))
                }
                className="flex h-10 w-full rounded-md border border-white/10 bg-slate-900 px-3 text-sm text-slate-100"
              >
                <option value={MediaType.IMAGE}>IMAGE</option>
                <option value={MediaType.VIDEO}>VIDEO</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-200">Media URL</label>
              <Input
                value={form.mediaUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, mediaUrl: event.target.value }))
                }
                placeholder="https://..."
                className="border-white/10 bg-slate-900 text-slate-100"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-200">Deskripsi</label>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                rows={4}
                placeholder="Ceritakan konteks project, hasil, atau keunikan karya ini."
                className="flex w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="mb-3 text-sm font-medium text-slate-200">Preview Ringkas</p>
            {form.mediaUrl.trim() ? (
              <div className="space-y-3">
                {form.mediaType === MediaType.IMAGE ? (
                  <img
                    src={form.mediaUrl}
                    alt={form.title || "Portfolio preview"}
                    className="h-56 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
                    Video preview menggunakan link eksternal.
                    <div className="mt-2 break-all text-cyan-300">{form.mediaUrl}</div>
                  </div>
                )}
                <div>
                  <p className="font-medium text-white">{form.title || "Untitled Portfolio"}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {form.description || "Belum ada deskripsi portfolio."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
                Preview akan muncul setelah media URL diisi.
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void handleSubmit()} disabled={isSubmitting}>
              {isSubmitting
                ? "Menyimpan..."
                : form.mode === "create"
                  ? "Tambah Portfolio"
                  : "Simpan Perubahan"}
            </Button>
            {form.mode === "edit" ? (
              <Button variant="outline" onClick={resetForm} disabled={isSubmitting}>
                Batal Edit
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-white/10 bg-slate-950/65 text-slate-100 backdrop-blur">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle>Daftar Portfolio</CardTitle>
              <p className="mt-2 text-sm text-slate-400">
                Kelola galeri karya vendor lengkap dengan filter dan preview cepat.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Cari judul/deskripsi portfolio"
                className="border-white/10 bg-slate-900 text-slate-100"
              />
              <select
                value={mediaFilter}
                onChange={(event) => setMediaFilter(event.target.value as MediaFilter)}
                className="flex h-10 rounded-md border border-white/10 bg-slate-900 px-3 text-sm text-slate-100"
              >
                <option value="all">Semua Media</option>
                <option value={MediaType.IMAGE}>IMAGE</option>
                <option value={MediaType.VIDEO}>VIDEO</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {visibleItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
              {items.length === 0
                ? "Belum ada item portfolio vendor."
                : "Tidak ada item portfolio yang cocok dengan pencarian atau filter saat ini."}
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {visibleItems.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                >
                  <div className="aspect-[16/9] bg-slate-950/80">
                    {item.mediaType === MediaType.IMAGE ? (
                      <img
                        src={item.mediaUrl}
                        alt={item.title || "Portfolio preview"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-300">
                        Video eksternal
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-white">
                          {item.title || "Untitled Portfolio"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          {item.description || "Belum ada deskripsi portfolio."}
                        </p>
                      </div>
                      <span className="rounded-full bg-cyan-400/10 px-2 py-1 text-xs font-medium text-cyan-300">
                        {item.mediaType}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-500">
                      <p>Dibuat: {dateFormatter.format(item.createdAt)}</p>
                      <p>Update terakhir: {dateFormatter.format(item.updatedAt)}</p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-cyan-300">
                      <a href={item.mediaUrl} target="_blank" rel="noreferrer" className="break-all">
                        {item.mediaUrl}
                      </a>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <a href={item.mediaUrl} target="_blank" rel="noreferrer">
                          Buka Media
                        </a>
                      </Button>
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
                  </div>
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

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <Card className="border border-white/10 bg-slate-950/65 text-slate-100 backdrop-blur">
      <CardContent className="space-y-2 p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
        <p className={`text-2xl font-semibold ${accent}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
