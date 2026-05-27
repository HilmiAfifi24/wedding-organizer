"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@wo/ui-components";
import { registerSchema, type RegisterInput } from "../validators/auth";
import { registerVendorAction, getCategoriesAction } from "../actions/auth-actions";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

export function RegisterForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      vendorName: "",
      categoryId: "",
    },
  });

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await getCategoriesAction();
        if (res.success && res.categories) {
          setCategories(res.categories);
        }
      } catch (err) {
        console.error("Gagal memuat kategori:", err);
      } finally {
        setFetchingCategories(false);
      }
    }
    loadCategories();
  }, []);

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await registerVendorAction(data);
      if (!res.success) {
        setError(res.error || "Gagal mendaftar");
      } else {
        setSuccess(res.message || "Pendaftaran vendor berhasil!");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border border-white/20 bg-white/80 p-2 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-amber-500/10 dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-6 w-6 text-amber-600 dark:text-amber-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Daftar Vendor Baru
        </CardTitle>
        <CardDescription className="text-zinc-500 dark:text-zinc-400">
          Bergabunglah untuk mempromosikan layanan pernikahan Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-600 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5 shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-600 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50 animate-pulse">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5 shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Nama Pemilik (Owner)
            </label>
            <Input
              {...register("name")}
              type="text"
              placeholder="John Doe"
              className="transition-all duration-300 focus:border-amber-500 focus:ring-amber-500/20 dark:bg-zinc-900"
            />
            {errors.name && (
              <span className="text-xs text-rose-500">{errors.name.message}</span>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Nama Vendor / Bisnis
            </label>
            <Input
              {...register("vendorName")}
              type="text"
              placeholder="e.g. Royal Catering, Golden Venue"
              className="transition-all duration-300 focus:border-amber-500 focus:ring-amber-500/20 dark:bg-zinc-900"
            />
            {errors.vendorName && (
              <span className="text-xs text-rose-500">{errors.vendorName.message}</span>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Kategori Layanan
            </label>
            <select
              {...register("categoryId")}
              disabled={fetchingCategories}
              className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-900"
            >
              <option value="" className="dark:bg-zinc-950">
                {fetchingCategories ? "Memuat Kategori..." : "-- Pilih Kategori --"}
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="dark:bg-zinc-950">
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <span className="text-xs text-rose-500">{errors.categoryId.message}</span>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Email Bisnis
            </label>
            <Input
              {...register("email")}
              type="email"
              placeholder="bisnis@email.com"
              className="transition-all duration-300 focus:border-amber-500 focus:ring-amber-500/20 dark:bg-zinc-900"
            />
            {errors.email && (
              <span className="text-xs text-rose-500">{errors.email.message}</span>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <div className="relative">
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••"
                className="pr-10 transition-all duration-300 focus:border-amber-500 focus:ring-amber-500/20 dark:bg-zinc-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.815 7.815L21 21m-3.955-3.955l-3.9-3.9M12 10.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs text-rose-500">{errors.password.message}</span>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Konfirmasi Password
            </label>
            <Input
              {...register("confirmPassword")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••"
              className="transition-all duration-300 focus:border-amber-500 focus:ring-amber-500/20 dark:bg-zinc-900"
            />
            {errors.confirmPassword && (
              <span className="text-xs text-rose-500">{errors.confirmPassword.message}</span>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 text-white hover:bg-amber-700 active:scale-[0.98] transition-transform duration-100 dark:bg-amber-700 dark:hover:bg-amber-600 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Mendaftarkan Vendor...
              </span>
            ) : (
              "Daftar Sebagai Vendor"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <div>
          Sudah punya akun Vendor?{" "}
          <Link
            href="/login"
            className="font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
          >
            Masuk Vendor
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
