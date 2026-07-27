"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@wo/ui-components";
import { loginSchema, type LoginInput } from "../schemas/auth";
import { USER_AUTH_ROUTES } from "../constants/routes";
import { useToast } from "@/shared/components/toaster";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const callbackUrl = searchParams.get("callbackUrl") || USER_AUTH_ROUTES.dashboard;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        const message =
          "Email atau password salah, akun bukan USER, atau akun sedang disuspend.";
        setError(message);
        toast({
          title: "Login gagal",
          description: message,
          variant: "error",
        });
      } else {
        toast({
          title: "Login berhasil",
          description: "Anda akan diarahkan ke halaman berikutnya.",
        });
        router.push(res?.url || callbackUrl);
        router.refresh();
      }
    } catch {
      const message = "Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.";
      setError(message);
      toast({
        title: "Login gagal",
        description: message,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md rounded-[28px] border-white/70 bg-white/88 shadow-[0_28px_80px_rgba(15,23,42,0.12)] backdrop-blur">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-slate-950">Masuk ke akun Anda</CardTitle>
        <CardDescription className="text-sm leading-6 text-slate-600">
          Akses booking, pembayaran, dan review vendor dari satu tempat.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <Input
              {...register("email")}
              type="email"
              placeholder="nama@email.com"
              className="h-11 rounded-2xl border-slate-200 bg-white text-slate-900"
            />
            {errors.email ? <span className="text-xs text-rose-600">{errors.email.message}</span> : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <Link href={USER_AUTH_ROUTES.forgotPassword} className="text-xs font-medium text-rose-600 hover:text-rose-700">
                Lupa password?
              </Link>
            </div>
            <Input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className="h-11 rounded-2xl border-slate-200 bg-white text-slate-900"
            />
            {errors.password ? <span className="text-xs text-rose-600">{errors.password.message}</span> : null}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-2xl bg-rose-600 text-white hover:bg-rose-700"
          >
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-sm text-slate-600">
        <p>
          Belum punya akun?{" "}
          <Link
            href={`${USER_AUTH_ROUTES.register}${
              callbackUrl !== USER_AUTH_ROUTES.dashboard
                ? `?callbackUrl=${encodeURIComponent(callbackUrl)}`
                : ""
            }`}
            className="font-medium text-rose-600 hover:text-rose-700"
          >
            Daftar sekarang
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
