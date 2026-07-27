"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input } from "@wo/ui-components";

import { USER_AUTH_ROUTES } from "../constants/routes";
import { registerSchema, type RegisterInput } from "../schemas/auth";
import { authApi } from "../services/auth-api";
import { useToast } from "@/shared/components/toaster";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const callbackUrl = searchParams.get("callbackUrl");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await authApi.register(data);
      toast({
        title: "Registrasi berhasil",
        description: "Akun Anda siap digunakan. Silakan login untuk melanjutkan.",
      });
      router.push(
        callbackUrl
          ? `${USER_AUTH_ROUTES.login}?callbackUrl=${encodeURIComponent(callbackUrl)}`
          : USER_AUTH_ROUTES.login
      );
      router.refresh();
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Terjadi kesalahan saat mendaftarkan akun.";

      setError(message);
      toast({
        title: "Registrasi gagal",
        description: message,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md rounded-[28px] border-white/70 bg-white/88 shadow-[0_28px_80px_rgba(15,23,42,0.12)] backdrop-blur">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-slate-950">Buat akun customer</CardTitle>
        <CardDescription className="text-sm leading-6 text-slate-600">
          Daftar untuk menyimpan vendor favorit, membuat booking, dan memantau pembayaran Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nama lengkap</label>
            <Input
              {...register("fullName")}
              type="text"
              placeholder="Alya Putri"
              className="h-11 rounded-2xl border-slate-200 bg-white text-slate-900"
            />
            {errors.fullName ? <p className="text-xs text-rose-600">{errors.fullName.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <Input
              {...register("email")}
              type="email"
              placeholder="nama@email.com"
              className="h-11 rounded-2xl border-slate-200 bg-white text-slate-900"
            />
            {errors.email ? <p className="text-xs text-rose-600">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nomor telepon</label>
            <Input
              {...register("phoneNumber")}
              type="tel"
              placeholder="+6281234567890"
              className="h-11 rounded-2xl border-slate-200 bg-white text-slate-900"
            />
            {errors.phoneNumber ? <p className="text-xs text-rose-600">{errors.phoneNumber.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <Input
              {...register("password")}
              type="password"
              placeholder="Minimal 6 karakter"
              className="h-11 rounded-2xl border-slate-200 bg-white text-slate-900"
            />
            {errors.password ? <p className="text-xs text-rose-600">{errors.password.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Konfirmasi password</label>
            <Input
              {...register("confirmPassword")}
              type="password"
              placeholder="Ulangi password"
              className="h-11 rounded-2xl border-slate-200 bg-white text-slate-900"
            />
            {errors.confirmPassword ? (
              <p className="text-xs text-rose-600">{errors.confirmPassword.message}</p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-2xl bg-rose-600 text-white hover:bg-rose-700"
          >
            {isSubmitting ? "Mendaftarkan..." : "Buat akun"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-sm text-slate-600">
        <p>
          Sudah punya akun?{" "}
          <Link
            href={
              callbackUrl
                ? `${USER_AUTH_ROUTES.login}?callbackUrl=${encodeURIComponent(callbackUrl)}`
                : USER_AUTH_ROUTES.login
            }
            className="font-medium text-rose-600 hover:text-rose-700"
          >
            Masuk di sini
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
