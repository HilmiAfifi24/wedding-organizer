"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input } from "@wo/ui-components";

import { forgotPasswordSchema, type ForgotPasswordInput } from "../schemas/auth";
import { authApi } from "../services/auth-api";
import { USER_AUTH_ROUTES } from "../constants/routes";
import { useToast } from "@/shared/components/toaster";

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await authApi.requestPasswordReset(data);
      toast({
        title: "Permintaan terkirim",
        description: "Jika email terdaftar, instruksi reset password akan dikirimkan.",
      });
      reset();
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Terjadi kesalahan saat mengirim permintaan.";

      setError(message);
      toast({
        title: "Permintaan gagal",
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
        <CardTitle className="text-2xl text-slate-950">Lupa Password</CardTitle>
        <CardDescription className="text-sm leading-6 text-slate-600">
          Masukkan email akun Anda. Kami akan mengirim instruksi reset secara aman jika akun ditemukan.
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
            <label className="text-sm font-medium text-slate-700">Email</label>
            <Input
              {...register("email")}
              type="email"
              placeholder="nama@email.com"
              className="h-11 rounded-2xl border-slate-200 bg-white text-slate-900"
            />
            {errors.email ? <p className="text-xs text-rose-600">{errors.email.message}</p> : null}
          </div>

          <Button type="submit" className="h-11 w-full rounded-2xl bg-rose-600 text-white hover:bg-rose-700" disabled={isSubmitting}>
            {isSubmitting ? "Mengirim..." : "Kirim Instruksi"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-sm text-slate-600">
        <p>
          Sudah ingat password?{" "}
          <Link href={USER_AUTH_ROUTES.login} className="font-medium text-rose-600 hover:text-rose-700">
            Kembali ke login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
