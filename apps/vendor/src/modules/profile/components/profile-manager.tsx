"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState, type ReactNode } from "react";
import { VendorStatus, type CategoryDTO, type VendorProfileDTO } from "@wo/shared-types";
import {
  Badge,
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
import { useForm } from "react-hook-form";
import { z } from "zod";

import { getVendorStatusBadgeVariant } from "../constants";
import { vendorProfileUpdateSchema, vendorResubmitSchema } from "../schemas/profile";
import { vendorProfileApi } from "../services/profile-api";
import { VENDOR_STATUS_LABEL } from "../types";

type ProfileFormInput = z.input<typeof vendorProfileUpdateSchema>;

type AppToast = {
  id: string;
  title: string;
  description: string;
  tone: "success" | "error";
};

const toProgress = (profile: VendorProfileDTO) => {
  const items = [
    profile.checklist.businessNameExists,
    profile.checklist.categoryExists,
    profile.checklist.phoneNumberValid,
    profile.checklist.addressCompleted,
    profile.checklist.hasMinimumService,
    profile.checklist.hasMinimumPortfolio,
  ];

  const completedItems = items.filter(Boolean).length;
  const totalItems = items.length;

  return {
    completedItems,
    totalItems,
    progressPercentage: Math.round((completedItems / totalItems) * 100),
  };
};

interface ProfileManagerProps {
  initialProfile: VendorProfileDTO;
  categories: CategoryDTO[];
}

export function ProfileManager({ initialProfile, categories }: ProfileManagerProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [resubmitNote, setResubmitNote] = useState("");
  const [toasts, setToasts] = useState<AppToast[]>([]);

  const progress = useMemo(() => toProgress(profile), [profile]);

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

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm<ProfileFormInput>({
    defaultValues: {
      businessName: profile.businessName ?? "",
      description: profile.description ?? "",
      categoryId: profile.categoryId ?? "",
      businessType: profile.businessType ?? "",
      establishedYear: profile.establishedYear ?? undefined,
      phoneNumber: profile.phoneNumber ?? "",
      whatsappNumber: profile.whatsappNumber ?? "",
      website: profile.website ?? "",
      businessAddress: profile.businessAddress ?? "",
      city: profile.city ?? "",
      province: profile.province ?? "",
      postalCode: profile.postalCode ?? "",
      instagramUrl: profile.instagramUrl ?? "",
      tiktokUrl: profile.tiktokUrl ?? "",
      facebookUrl: profile.facebookUrl ?? "",
      youtubeUrl: profile.youtubeUrl ?? "",
    },
  });

  const applyProfile = (next: VendorProfileDTO) => {
    setProfile(next);
    reset({
      businessName: next.businessName ?? "",
      description: next.description ?? "",
      categoryId: next.categoryId ?? "",
      businessType: next.businessType ?? "",
      establishedYear: next.establishedYear ?? undefined,
      phoneNumber: next.phoneNumber ?? "",
      whatsappNumber: next.whatsappNumber ?? "",
      website: next.website ?? "",
      businessAddress: next.businessAddress ?? "",
      city: next.city ?? "",
      province: next.province ?? "",
      postalCode: next.postalCode ?? "",
      instagramUrl: next.instagramUrl ?? "",
      tiktokUrl: next.tiktokUrl ?? "",
      facebookUrl: next.facebookUrl ?? "",
      youtubeUrl: next.youtubeUrl ?? "",
    });
  };

  const onSubmit = async (values: ProfileFormInput) => {
    setError(null);
    setIsSubmitting(true);
    clearErrors();

    try {
      const parsed = vendorProfileUpdateSchema.safeParse(values);
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          const path = issue.path[0];
          if (typeof path === "string") {
            setFieldError(path as keyof ProfileFormInput, {
              type: "manual",
              message: issue.message,
            });
          }
        }
        return;
      }

      const updated = await vendorProfileApi.update({
        businessName: parsed.data.businessName,
        description: parsed.data.description?.trim() || undefined,
        categoryId: parsed.data.categoryId,
        businessType: parsed.data.businessType?.trim() || undefined,
        establishedYear: parsed.data.establishedYear,
        phoneNumber: parsed.data.phoneNumber,
        whatsappNumber: parsed.data.whatsappNumber?.trim() || undefined,
        website: parsed.data.website?.trim() || undefined,
        businessAddress: parsed.data.businessAddress,
        city: parsed.data.city,
        province: parsed.data.province,
        postalCode: parsed.data.postalCode?.trim() || undefined,
        instagramUrl: parsed.data.instagramUrl?.trim() || undefined,
        tiktokUrl: parsed.data.tiktokUrl?.trim() || undefined,
        facebookUrl: parsed.data.facebookUrl?.trim() || undefined,
        youtubeUrl: parsed.data.youtubeUrl?.trim() || undefined,
      });

      applyProfile(updated);
      addToast({
        title: "Profil diperbarui",
        description: "Data profil vendor berhasil diperbarui.",
        tone: "success",
      });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Gagal menyimpan profil";
      setError(message);
      addToast({
        title: "Update gagal",
        description: message,
        tone: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadImage = async (kind: "logo" | "cover", file?: File) => {
    if (!file) {
      return;
    }

    if (kind === "logo") {
      setIsLogoUploading(true);
    } else {
      setIsCoverUploading(true);
    }

    try {
      const updated =
        kind === "logo" ? await vendorProfileApi.uploadLogo(file) : await vendorProfileApi.uploadCover(file);

      applyProfile(updated);
      addToast({
        title: kind === "logo" ? "Logo diperbarui" : "Cover diperbarui",
        description: "Media profil berhasil diperbarui.",
        tone: "success",
      });
    } catch (uploadError) {
      addToast({
        title: "Upload gagal",
        description: uploadError instanceof Error ? uploadError.message : "Gagal upload gambar",
        tone: "error",
      });
    } finally {
      if (kind === "logo") {
        setIsLogoUploading(false);
      } else {
        setIsCoverUploading(false);
      }
    }
  };

  const handleResubmit = async () => {
    setIsResubmitting(true);

    try {
      const payload = vendorResubmitSchema.parse({
        confirmation: true,
        note: resubmitNote,
      });
      const updated = await vendorProfileApi.resubmit(payload);

      applyProfile(updated);
      setResubmitNote("");
      addToast({
        title: "Resubmission berhasil",
        description: "Profil vendor dikirim ulang untuk review admin.",
        tone: "success",
      });
    } catch (resubmitError) {
      addToast({
        title: "Resubmission gagal",
        description: resubmitError instanceof Error ? resubmitError.message : "Aksi tidak dapat diproses",
        tone: "error",
      });
    } finally {
      setIsResubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card className="border border-white/10 bg-slate-950/65 text-slate-100">
          <CardHeader>
            <CardTitle>Profil Bisnis Vendor</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Business Name" error={errors.businessName?.message}>
                  <Input {...register("businessName")} className="border-white/10 bg-slate-900 text-slate-100" />
                </Field>
                <Field label="Category" error={errors.categoryId?.message}>
                  <select
                    {...register("categoryId")}
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

                <Field label="Business Type" error={errors.businessType?.message}>
                  <Input {...register("businessType")} className="border-white/10 bg-slate-900 text-slate-100" />
                </Field>
                <Field label="Established Year" error={errors.establishedYear?.message}>
                  <Input type="number" {...register("establishedYear")} className="border-white/10 bg-slate-900 text-slate-100" />
                </Field>

                <Field label="Phone Number" error={errors.phoneNumber?.message}>
                  <Input {...register("phoneNumber")} className="border-white/10 bg-slate-900 text-slate-100" />
                </Field>
                <Field label="WhatsApp Number" error={errors.whatsappNumber?.message}>
                  <Input {...register("whatsappNumber")} className="border-white/10 bg-slate-900 text-slate-100" />
                </Field>

                <Field label="Website" error={errors.website?.message}>
                  <Input {...register("website")} className="border-white/10 bg-slate-900 text-slate-100" />
                </Field>
                <Field label="Postal Code" error={errors.postalCode?.message}>
                  <Input {...register("postalCode")} className="border-white/10 bg-slate-900 text-slate-100" />
                </Field>

                <Field label="City" error={errors.city?.message}>
                  <Input {...register("city")} className="border-white/10 bg-slate-900 text-slate-100" />
                </Field>
                <Field label="Province" error={errors.province?.message}>
                  <Input {...register("province")} className="border-white/10 bg-slate-900 text-slate-100" />
                </Field>

                <Field label="Business Address" error={errors.businessAddress?.message} className="md:col-span-2">
                  <textarea
                    {...register("businessAddress")}
                    rows={3}
                    className="flex w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                  />
                </Field>

                <Field label="Description" error={errors.description?.message} className="md:col-span-2">
                  <textarea
                    {...register("description")}
                    rows={4}
                    className="flex w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Instagram URL" error={errors.instagramUrl?.message}>
                  <Input {...register("instagramUrl")} className="border-white/10 bg-slate-900 text-slate-100" />
                </Field>
                <Field label="TikTok URL" error={errors.tiktokUrl?.message}>
                  <Input {...register("tiktokUrl")} className="border-white/10 bg-slate-900 text-slate-100" />
                </Field>
                <Field label="Facebook URL" error={errors.facebookUrl?.message}>
                  <Input {...register("facebookUrl")} className="border-white/10 bg-slate-900 text-slate-100" />
                </Field>
                <Field label="YouTube URL" error={errors.youtubeUrl?.message}>
                  <Input {...register("youtubeUrl")} className="border-white/10 bg-slate-900 text-slate-100" />
                </Field>
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border border-white/10 bg-slate-950/65 text-slate-100">
            <CardHeader>
              <CardTitle>Status Verifikasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-300">Status</p>
                <Badge variant={getVendorStatusBadgeVariant(profile.status)}>
                  {VENDOR_STATUS_LABEL[profile.status]}
                </Badge>
              </div>

              {profile.status === VendorStatus.REJECTED && profile.rejectionReason ? (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                  <p className="font-semibold">Rejection Reason</p>
                  <p className="mt-1">{profile.rejectionReason}</p>
                </div>
              ) : null}

              {profile.status === VendorStatus.SUSPENDED ? (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
                  <p className="font-semibold">Akun Suspended</p>
                  <p className="mt-1">{profile.suspensionReason || "Akun sedang dinonaktifkan sementara."}</p>
                </div>
              ) : null}

              <div>
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-cyan-100/80">
                  <span>Onboarding Progress</span>
                  <span>{progress.progressPercentage}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-900/80">
                  <div
                    className="h-2 rounded-full bg-cyan-300 transition-all"
                    style={{ width: `${progress.progressPercentage}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-300">
                  {progress.completedItems} / {progress.totalItems} checklist selesai
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-slate-950/65 text-slate-100">
            <CardHeader>
              <CardTitle>Media Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Logo</p>
                {profile.logoUrl ? (
                  <img src={profile.logoUrl} alt="Logo vendor" className="h-24 w-24 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-white/20 text-xs text-slate-400">
                    Belum ada
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(event) => void uploadImage("logo", event.target.files?.[0])}
                  disabled={isLogoUploading}
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Cover Image</p>
                {profile.coverImageUrl ? (
                  <img
                    src={profile.coverImageUrl}
                    alt="Cover vendor"
                    className="h-36 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-full items-center justify-center rounded-xl border border-dashed border-white/20 text-xs text-slate-400">
                    Belum ada
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(event) => void uploadImage("cover", event.target.files?.[0])}
                  disabled={isCoverUploading}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-slate-950/65 text-slate-100">
            <CardHeader>
              <CardTitle>Checklist Verifikasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <ChecklistItem done={profile.checklist.businessNameExists} label="Business name tersedia" />
              <ChecklistItem done={profile.checklist.categoryExists} label="Kategori dipilih" />
              <ChecklistItem done={profile.checklist.phoneNumberValid} label="Nomor telepon valid" />
              <ChecklistItem done={profile.checklist.addressCompleted} label="Alamat lengkap" />
              <ChecklistItem done={profile.checklist.hasMinimumService} label="Minimal 1 service" />
              <ChecklistItem done={profile.checklist.hasMinimumPortfolio} label="Minimal 1 portfolio" />
            </CardContent>
          </Card>

          {profile.status === VendorStatus.REJECTED ? (
            <Card className="border border-white/10 bg-slate-950/65 text-slate-100">
              <CardHeader>
                <CardTitle>Resubmit Verifikasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <textarea
                  value={resubmitNote}
                  onChange={(event) => setResubmitNote(event.target.value)}
                  placeholder="Catatan opsional untuk admin"
                  rows={3}
                  className="flex w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                />
                <Button
                  onClick={() => void handleResubmit()}
                  disabled={isResubmitting || !profile.checklist.isComplete}
                >
                  {isResubmitting ? "Mengirim..." : "Resubmit Untuk Review"}
                </Button>
                {!profile.checklist.isComplete ? (
                  <p className="text-xs text-amber-300">Lengkapi checklist sebelum resubmit.</p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          open
          onOpenChange={(open) => {
            if (!open) {
              dismissToast(toast.id);
            }
          }}
          duration={2500}
          className={
            toast.tone === "error"
              ? "border-danger/40 bg-danger/10"
              : "border-success/40 bg-success/10"
          }
        >
          <ToastTitle>{toast.title}</ToastTitle>
          <ToastDescription>{toast.description}</ToastDescription>
          <ToastClose />
        </Toast>
      ))}
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

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <span className="text-slate-300">{label}</span>
      <span className={done ? "text-emerald-300" : "text-amber-300"}>{done ? "Siap" : "Belum"}</span>
    </div>
  );
}
