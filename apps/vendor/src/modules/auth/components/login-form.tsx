"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@wo/ui-components";

import { loginSchema, type LoginInput } from "../schemas/auth";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah, atau akun tidak memiliki akses vendor.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan saat login. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-white/10 bg-slate-950/75 text-slate-100 backdrop-blur">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-3xl">Masuk Vendor</CardTitle>
        <CardDescription className="text-slate-400">
          Akses workspace vendor untuk onboarding, layanan, dan booking.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Email</label>
            <Input
              {...register("email")}
              type="email"
              placeholder="vendor@email.com"
              className="border-white/10 bg-slate-900 text-slate-100"
            />
            {errors.email ? (
              <p className="text-xs text-rose-300">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Password</label>
            <Input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className="border-white/10 bg-slate-900 text-slate-100"
            />
            {errors.password ? (
              <p className="text-xs text-rose-300">{errors.password.message}</p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Memproses..." : "Masuk ke Portal"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-cyan-300 hover:text-cyan-200">
            Daftar vendor
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
