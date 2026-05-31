"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { CategoryDTO } from "@wo/shared-types";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@wo/ui-components";

import { registerSchema, type RegisterInput } from "../schemas/auth";

interface RegisterFormProps {
  categories: CategoryDTO[];
}

export function RegisterForm({ categories }: RegisterFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasCategories = categories.length > 0;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      ownerName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      businessName: "",
      categoryId: "",
      businessAddress: "",
      city: "",
      province: "",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/vendor/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const body = (await response.json().catch(() => null)) as
        | { success: true; message: string }
        | { success: false; message?: string };

      if (!response.ok || !body?.success) {
        setError(body?.message || "Registrasi vendor gagal diproses.");
        return;
      }

      setSuccess("Registrasi berhasil. Silakan login untuk melanjutkan onboarding vendor.");
      window.setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch {
      setError("Terjadi kesalahan saat mengirim pendaftaran vendor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl border-white/10 bg-slate-950/75 text-slate-100 backdrop-blur">
      <CardHeader className="space-y-2">
        <CardTitle className="text-3xl">Registrasi Vendor</CardTitle>
        <CardDescription className="text-slate-400">
          Buat akun vendor, lalu lanjutkan onboarding sampai siap direview admin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              Kategori vendor belum tersedia. Tambahkan kategori dari admin panel sebelum vendor
              baru melakukan registrasi.
            </div>
          ) : null}

          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
              Account Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Owner Name" error={errors.ownerName?.message}>
                <Input {...register("ownerName")} className="border-white/10 bg-slate-900 text-slate-100" />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <Input {...register("email")} type="email" className="border-white/10 bg-slate-900 text-slate-100" />
              </Field>
              <Field label="Phone Number" error={errors.phoneNumber?.message}>
                <Input {...register("phoneNumber")} className="border-white/10 bg-slate-900 text-slate-100" />
              </Field>
              <Field label="Password" error={errors.password?.message}>
                <Input {...register("password")} type="password" className="border-white/10 bg-slate-900 text-slate-100" />
              </Field>
              <Field label="Confirm Password" error={errors.confirmPassword?.message}>
                <Input
                  {...register("confirmPassword")}
                  type="password"
                  className="border-white/10 bg-slate-900 text-slate-100"
                />
              </Field>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
              Business Information
            </h3>
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
              <Field
                label="Business Address"
                error={errors.businessAddress?.message}
                className="md:col-span-2"
              >
                <textarea
                  {...register("businessAddress")}
                  rows={3}
                  className="flex w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                />
              </Field>
              <Field label="City" error={errors.city?.message}>
                <Input {...register("city")} className="border-white/10 bg-slate-900 text-slate-100" />
              </Field>
              <Field label="Province" error={errors.province?.message}>
                <Input {...register("province")} className="border-white/10 bg-slate-900 text-slate-100" />
              </Field>
            </div>
          </section>

          <Button
            type="submit"
            className="w-full md:w-auto"
            disabled={isSubmitting || !hasCategories}
          >
            {isSubmitting ? "Mendaftarkan vendor..." : "Daftar Vendor"}
          </Button>
        </form>

        <div className="mt-6 text-sm text-slate-400">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-cyan-300 hover:text-cyan-200">
            Masuk vendor
          </Link>
        </div>
      </CardContent>
    </Card>
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
