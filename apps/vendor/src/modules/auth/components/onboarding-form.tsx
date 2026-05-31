"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { CategoryDTO, VendorOnboardingDTO } from "@wo/shared-types";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@wo/ui-components";

import { onboardingSchema, type OnboardingInput } from "../schemas/auth";

interface OnboardingFormProps {
  initialData: VendorOnboardingDTO;
  categories: CategoryDTO[];
}

export function OnboardingForm({ initialData, categories }: OnboardingFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentData, setCurrentData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasCategories = categories.length > 0;

  const checklistItems = useMemo(
    () => [
      {
        label: "Business name tersedia",
        done: currentData.checklist.businessNameExists,
      },
      {
        label: "Kategori dipilih",
        done: currentData.checklist.categoryExists,
      },
      {
        label: "Nomor telepon valid",
        done: currentData.checklist.phoneNumberValid,
      },
      {
        label: "Alamat lengkap",
        done: currentData.checklist.addressCompleted,
      },
      {
        label: "Minimal 1 service",
        done: currentData.checklist.hasMinimumService,
      },
      {
        label: "Minimal 1 portfolio",
        done: currentData.checklist.hasMinimumPortfolio,
      },
    ],
    [currentData]
  );

  const completedChecklistItems = checklistItems.filter((item) => item.done).length;
  const progressPercentage = Math.round((completedChecklistItems / checklistItems.length) * 100);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      businessName: currentData.businessName ?? "",
      description: currentData.description ?? "",
      categoryId: currentData.categoryId ?? "",
      phoneNumber: currentData.phoneNumber ?? "",
      businessAddress: currentData.businessAddress ?? "",
      city: currentData.city ?? "",
      province: currentData.province ?? "",
    },
  });

  const onSubmit = async (data: OnboardingInput) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/vendor/onboarding", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const body = (await response.json().catch(() => null)) as
        | { success: true; data: VendorOnboardingDTO; message: string }
        | { success: false; message?: string };

      if (!response.ok || !body?.success) {
        setError(body?.message || "Gagal memperbarui onboarding vendor.");
        return;
      }

      setCurrentData(body.data);
      reset({
        businessName: body.data.businessName ?? "",
        description: body.data.description ?? "",
        categoryId: body.data.categoryId ?? "",
        phoneNumber: body.data.phoneNumber ?? "",
        businessAddress: body.data.businessAddress ?? "",
        city: body.data.city ?? "",
        province: body.data.province ?? "",
      });
      setSuccess(
        body.data.onboardingStatus === "READY_FOR_REVIEW"
          ? "Data onboarding tersimpan. Vendor siap untuk direview admin."
          : "Data onboarding tersimpan. Lengkapi checklist yang masih tersisa."
      );
    } catch {
      setError("Terjadi kesalahan saat menyimpan onboarding.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
      <Card className="border border-white/10 bg-slate-950/65 text-slate-100 backdrop-blur">
        <CardHeader>
          <CardTitle>Lengkapi Profil Vendor</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {success}
              </div>
            ) : null}

            {!hasCategories ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                Kategori vendor belum tersedia. Hubungi admin untuk menambahkan kategori sebelum
                onboarding dapat dilengkapi.
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Business Name" error={errors.businessName?.message}>
                <Input {...register("businessName")} className="border-white/10 bg-slate-900 text-slate-100" />
              </Field>
              <Field label="Category" error={errors.categoryId?.message}>
                <select
                  {...register("categoryId")}
                  disabled={!hasCategories}
                  className="flex h-10 w-full rounded-md border border-white/10 bg-slate-900 px-3 text-sm text-slate-100"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Phone Number" error={errors.phoneNumber?.message}>
                <Input {...register("phoneNumber")} className="border-white/10 bg-slate-900 text-slate-100" />
              </Field>
              <Field label="City" error={errors.city?.message}>
                <Input {...register("city")} className="border-white/10 bg-slate-900 text-slate-100" />
              </Field>
              <Field label="Province" error={errors.province?.message}>
                <Input {...register("province")} className="border-white/10 bg-slate-900 text-slate-100" />
              </Field>
              <Field label="Description" error={errors.description?.message} className="md:col-span-2">
                <textarea
                  {...register("description")}
                  rows={4}
                  className="flex w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                />
              </Field>
              <Field
                label="Business Address"
                error={errors.businessAddress?.message}
                className="md:col-span-2"
              >
                <textarea
                  {...register("businessAddress")}
                  rows={4}
                  className="flex w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                />
              </Field>
            </div>

            <Button type="submit" disabled={isSubmitting || !hasCategories}>
              {isSubmitting ? "Menyimpan..." : "Simpan Onboarding"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border border-white/10 bg-slate-950/65 text-slate-100 backdrop-blur">
          <CardHeader>
            <CardTitle>Status Verifikasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3">
              <p className="font-semibold text-cyan-200">
                {currentData.onboardingStatus === "READY_FOR_REVIEW"
                  ? "Ready For Review"
                  : "Incomplete"}
              </p>
              <p className="mt-1 text-slate-300">
                Status vendor: {currentData.status.replaceAll("_", " ")}
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-cyan-100/80">
                  <span>Checklist Progress</span>
                  <span>{progressPercentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-900/80">
                  <div
                    className="h-2 rounded-full bg-cyan-300 transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {currentData.rejectionReason ? (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-amber-100">
                <p className="font-semibold">Alasan penolakan sebelumnya</p>
                <p className="mt-1 text-sm text-amber-50/90">{currentData.rejectionReason}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-slate-950/65 text-slate-100 backdrop-blur">
          <CardHeader>
            <CardTitle>Checklist Verifikasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklistItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
              >
                <span className="text-slate-300">{item.label}</span>
                <span className={item.done ? "text-emerald-300" : "text-amber-300"}>
                  {item.done ? "Siap" : "Belum"}
                </span>
              </div>
            ))}

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              Service: {currentData.servicesCount} | Portfolio: {currentData.portfolioCount}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-slate-200">{label}</label>
      {children}
      {error ? <p className="mt-1 text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}
