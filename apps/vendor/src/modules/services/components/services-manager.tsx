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
};

const normalizeService = (service: ServiceDTO): ServiceDTO => ({
  ...service,
  createdAt: new Date(service.createdAt),
  updatedAt: new Date(service.updatedAt),
});

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const createDefaultForm = (): ServiceFormState => ({
  mode: "create",
  name: "",
  description: "",
  price: "",
  isActive: true,
});

interface ServicesManagerProps {
  initialServices: ServiceDTO[];
  vendorStatus: VendorStatus;
}

export function ServicesManager({ initialServices, vendorStatus }: ServicesManagerProps) {
  const [services, setServices] = useState<ServiceDTO[]>(initialServices.map(normalizeService));
  const [form, setForm] = useState<ServiceFormState>(createDefaultForm);
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

  const serviceCountText = useMemo(
    () =>
      services.length > 0
        ? `${services.length} layanan sudah tersedia.`
        : "Belum ada layanan. Tambahkan minimal 1 layanan untuk checklist approval.",
    [services.length]
  );

  const resetForm = () => {
    setForm(createDefaultForm());
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        price: Number(form.price),
        isActive: form.isActive,
      };

      if (form.mode === "create") {
        const created = await vendorServicesApi.create(payload);
        setServices((current) => [normalizeService(created), ...current]);
        addToast({
          title: "Layanan ditambahkan",
          description: `${created.name} berhasil ditambahkan.`,
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
    setForm({
      mode: "edit",
      serviceId: service.id,
      name: service.name,
      description: service.description ?? "",
      price: String(service.price),
      isActive: service.isActive,
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
        description: "Layanan berhasil dihapus dari vendor.",
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
          ) : null}

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
                className="flex w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              />
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
            Layanan aktif
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
        <CardHeader>
          <CardTitle>Daftar Layanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-400">{serviceCountText}</p>

          {services.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
              Belum ada layanan vendor.
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 lg:flex-row lg:items-start lg:justify-between"
                >
                  <div className="space-y-1">
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
                    <p className="text-sm text-slate-300">
                      {currencyFormatter.format(service.price)}
                    </p>
                    <p className="text-sm leading-6 text-slate-400">
                      {service.description || "Belum ada deskripsi layanan."}
                    </p>
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
