"use client";

import { useMemo, useState } from "react";
import type { ServiceDTO, VendorStatus } from "@wo/shared-types";
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

import { vendorServicesApi } from "../services-api";

type AppToast = {
  id: string;
  title: string;
  description: string;
  tone: "success" | "error";
};

type ServiceFormState = {
  mode: "create" | "edit";
  serviceId?: string;
  name: string;
  description: string;
  price: string;
  isActive: boolean;
  adatIds: string[];
};

type ServiceStatusFilter = "all" | "active" | "inactive";

const normalizeService = (service: ServiceDTO): ServiceDTO => ({
  ...service,
  createdAt: new Date(service.createdAt),
  updatedAt: new Date(service.updatedAt),
  adats: service.adats?.map((adat) => ({
    ...adat,
    createdAt: new Date(adat.createdAt),
    updatedAt: new Date(adat.updatedAt),
  })),
});

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

const createDefaultForm = (): ServiceFormState => ({
  mode: "create",
  name: "",
  description: "",
  price: "",
  isActive: true,
  adatIds: [],
});

interface ServicesManagerProps {
  initialServices: ServiceDTO[];
  initialAdats: { id: string; name: string }[];
  vendorStatus: VendorStatus;
}

export function ServicesManager({ initialServices, initialAdats, vendorStatus }: ServicesManagerProps) {
  const [services, setServices] = useState<ServiceDTO[]>(initialServices.map(normalizeService));
  const [form, setForm] = useState<ServiceFormState>(createDefaultForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ServiceStatusFilter>("all");
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

  const visibleServices = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return services
      .filter((service) => {
        if (statusFilter === "active" && !service.isActive) return false;
        if (statusFilter === "inactive" && service.isActive) return false;

        if (!normalizedQuery) return true;

        return [service.name, service.description ?? "", String(service.price)]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime());
  }, [searchQuery, services, statusFilter]);

  const metrics = useMemo(() => {
    const activeCount = services.filter((service) => service.isActive).length;
    const inactiveCount = services.length - activeCount;
    const averagePrice =
      services.length > 0
        ? Math.round(services.reduce((sum, service) => sum + service.price, 0) / services.length)
        : 0;

    return {
      total: services.length,
      activeCount,
      inactiveCount,
      averagePrice,
    };
  }, [services]);

  const resetForm = () => {
    setForm(createDefaultForm());
    setError(null);
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Nama layanan wajib diisi.";
    }

    if (form.name.trim().length < 2) {
      return "Nama layanan minimal 2 karakter.";
    }

    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) {
      return "Harga layanan tidak valid.";
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
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
        isActive: form.isActive,
        adatIds: form.adatIds,
      };

      if (form.mode === "create") {
        const created = await vendorServicesApi.create(payload);
        setServices((current) => [normalizeService(created), ...current]);
        addToast({
          title: "Layanan ditambahkan",
          description: `${created.name} berhasil ditambahkan ke katalog vendor.`,
          tone: "success",
        });
      } else if (form.serviceId) {
        const updated = await vendorServicesApi.update(form.serviceId, payload);
        setServices((current) =>
          current.map((service) =>
            service.id === updated.id ? normalizeService(updated) : service
          )
        );
        addToast({
          title: "Layanan diperbarui",
          description: `${updated.name} berhasil diperbarui.`,
          tone: "success",
        });
      }

      resetForm();
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Layanan gagal disimpan.";
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

  const handleEdit = (service: ServiceDTO) => {
    setError(null);
    setForm({
      mode: "edit",
      serviceId: service.id,
      name: service.name,
      description: service.description ?? "",
      price: String(service.price),
      isActive: service.isActive,
      adatIds: service.adats?.map((a) => a.id) ?? [],
    });
  };

  const handleDelete = async (serviceId: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await vendorServicesApi.remove(serviceId);
      setServices((current) => current.filter((service) => service.id !== serviceId));
      addToast({
        title: "Layanan dihapus",
        description: "Layanan berhasil dihapus dari katalog vendor.",
        tone: "success",
      });

      if (form.serviceId === serviceId) {
        resetForm();
      }
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "Layanan gagal dihapus.";
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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Layanan" value={`${metrics.total}`} accent="text-cyan-300" />
        <MetricCard label="Layanan Aktif" value={`${metrics.activeCount}`} accent="text-emerald-300" />
        <MetricCard label="Layanan Nonaktif" value={`${metrics.inactiveCount}`} accent="text-amber-300" />
        <MetricCard
          label="Rata-rata Harga"
          value={currencyFormatter.format(metrics.averagePrice)}
          accent="text-fuchsia-300"
        />
      </div>

      <Card className="border border-white/10 bg-slate-950/65 text-slate-100 backdrop-blur">
        <CardHeader>
          <CardTitle>{form.mode === "create" ? "Tambah Layanan" : "Edit Layanan"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isOnboardingState ? (
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
              Vendor onboarding membutuhkan minimal 1 layanan aktif agar approval admin bisa
              dilanjutkan.
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              Vendor sudah approved. Kelola katalog layanan agar siap ditampilkan dan menerima
              booking.
            </div>
          )}

          {error ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Nama Layanan</label>
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Contoh: Paket Rias Pengantin"
                className="border-white/10 bg-slate-900 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Harga</label>
              <Input
                value={form.price}
                onChange={(event) =>
                  setForm((current) => ({ ...current, price: event.target.value }))
                }
                type="number"
                min={0}
                placeholder="3500000"
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
                placeholder="Jelaskan cakupan layanan, benefit, dan informasi penting lainnya."
                className="flex w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-200">Adat / Budaya Tradisional</label>
              <div className="flex flex-wrap gap-4 rounded-md border border-white/10 bg-slate-900 p-3">
                {initialAdats.map((adat) => {
                  const isChecked = form.adatIds.includes(adat.id);
                  return (
                    <label key={adat.id} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer hover:text-white select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const nextAdatIds = e.target.checked
                            ? [...form.adatIds, adat.id]
                            : form.adatIds.filter((id) => id !== adat.id);
                          setForm((current) => ({ ...current, adatIds: nextAdatIds }));
                        }}
                        className="cursor-pointer rounded border-white/10 bg-slate-950 text-slate-100"
                      />
                      {adat.name}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((current) => ({ ...current, isActive: event.target.checked }))
              }
            />
            Layanan aktif dan siap ditawarkan
          </label>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void handleSubmit()} disabled={isSubmitting}>
              {isSubmitting
                ? "Menyimpan..."
                : form.mode === "create"
                  ? "Tambah Layanan"
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
              <CardTitle>Daftar Layanan</CardTitle>
              <p className="mt-2 text-sm text-slate-400">
                Cari, filter, dan kelola seluruh layanan vendor dari satu tempat.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Cari nama/deskripsi layanan"
                className="border-white/10 bg-slate-900 text-slate-100"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as ServiceStatusFilter)}
                className="flex h-10 rounded-md border border-white/10 bg-slate-900 px-3 text-sm text-slate-100"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {visibleServices.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
              {services.length === 0
                ? "Belum ada layanan vendor."
                : "Tidak ada layanan yang cocok dengan pencarian atau filter saat ini."}
            </div>
          ) : (
            <div className="space-y-3">
              {visibleServices.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 lg:flex-row lg:items-start lg:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-white">{service.name}</p>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          service.isActive
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-amber-500/15 text-amber-300"
                        }`}
                      >
                        {service.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-cyan-200">
                      {currencyFormatter.format(service.price)}
                    </p>
                    {service.adats && service.adats.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-1 mb-2">
                        {service.adats.map((adat) => (
                          <span
                            key={adat.id}
                            className="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-xs text-slate-300 font-medium"
                          >
                            {adat.name}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <p className="max-w-3xl text-sm leading-6 text-slate-400">
                      {service.description || "Belum ada deskripsi layanan."}
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      <span>Dibuat: {dateFormatter.format(service.createdAt)}</span>
                      <span>Update terakhir: {dateFormatter.format(service.updatedAt)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(service)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-300"
                      onClick={() => void handleDelete(service.id)}
                      disabled={isSubmitting}
                    >
                      Hapus
                    </Button>
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
