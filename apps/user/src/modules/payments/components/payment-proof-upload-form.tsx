"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@wo/ui-components";

import { PAYMENT_PROOF_ACCEPT_ATTRIBUTE, PAYMENT_TYPE_LABELS, formatPaymentPrice } from "../constants";
import { paymentsApi } from "../services/payments-api";
import { paymentProofUploadSchema, type PaymentProofUploadInput } from "../schemas/payment-upload";
import type { UserPaymentTermUploadContextDTO } from "../types";
import { isImageFile, isPdfFile } from "../services/file-preview";
import { useToast } from "@/shared/components/toaster";

type PaymentProofUploadFormValues = Omit<PaymentProofUploadInput, "file"> & {
  file?: File;
};

export function PaymentProofUploadForm({ context }: { context: UserPaymentTermUploadContextDTO }) {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setError: setFieldError,
    clearErrors,
    formState: { errors },
  } = useForm<PaymentProofUploadFormValues>({
    defaultValues: {
      bookingId: context.bookingId,
      paymentTermId: context.term.id,
      amount: context.term.amount,
      note: "",
    },
  });

  const amount = useWatch({ control, name: "amount" });
  const previewSource = useMemo(() => {
    return selectedFile ? URL.createObjectURL(selectedFile) : null;
  }, [selectedFile]);
  const hasRejectedPreviousProof = context.term.status === "REJECTED";

  useEffect(() => {
    return () => {
      if (previewSource) {
        URL.revokeObjectURL(previewSource);
      }
    };
  }, [previewSource]);

  const onSubmit = async (values: PaymentProofUploadFormValues) => {
    setIsSubmitting(true);
    setError(null);
    clearErrors();

    try {
      const validation = paymentProofUploadSchema.safeParse({
        ...values,
        file: selectedFile ?? undefined,
      });

      if (!validation.success) {
        for (const issue of validation.error.issues) {
          const fieldName = issue.path[0];

          if (fieldName === "file" || fieldName === "amount" || fieldName === "note") {
            setFieldError(fieldName, { type: "manual", message: issue.message });
          } else if (fieldName === "bookingId" || fieldName === "paymentTermId") {
            setFieldError(fieldName, { type: "manual", message: issue.message });
          } else {
            setFieldError("note", { type: "manual", message: issue.message });
          }
        }

        return;
      }

      const response = await paymentsApi.uploadProof(validation.data);
      toast({
        title: hasRejectedPreviousProof ? "Bukti pembayaran berhasil diunggah ulang" : "Bukti pembayaran berhasil diunggah",
        description: "Menunggu verifikasi dari vendor.",
      });
      router.push(`/payments/${response.data.id}`);
      router.refresh();
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Terjadi kesalahan saat mengunggah bukti pembayaran.";

      setError(message);
      toast({
        title: "Upload gagal",
        description: message,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileLabel = useMemo(() => {
    if (!selectedFile) {
      return "Pilih file JPG, PNG, WEBP, atau PDF";
    }

    return `${selectedFile.name} (${Math.ceil(selectedFile.size / 1024)} KB)`;
  }, [selectedFile]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <Card className="rounded-[28px] border-white/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-950">Ringkasan termin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div>
              <p className="text-lg font-semibold text-slate-950">
                Termin {context.term.sequence} · {PAYMENT_TYPE_LABELS[context.term.type]}
              </p>
              <p className="mt-1">{context.vendor.businessName}</p>
              <p className="mt-1 text-2xl font-semibold text-rose-600">
                {formatPaymentPrice(context.term.amount)}
              </p>
            </div>
            {context.term.latestProof?.rejectionReason ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
                Alasan penolakan sebelumnya: {context.term.latestProof.rejectionReason}
              </div>
            ) : null}
            <Button asChild variant="outline" className="h-10 rounded-2xl">
              <Link href={`/bookings/${context.bookingId}/payments`}>Kembali ke summary pembayaran</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-white/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-950">Preview file</CardTitle>
          </CardHeader>
          <CardContent>
            {previewSource ? (
              isImageFile(previewSource) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewSource}
                  alt="Preview bukti pembayaran"
                  className="h-auto w-full rounded-3xl border border-slate-200 object-cover"
                />
              ) : isPdfFile(previewSource) ? (
                <iframe
                  src={previewSource}
                  title="Preview PDF"
                  className="h-[480px] w-full rounded-3xl border border-slate-200 bg-white"
                />
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                  Preview file belum tersedia untuk format ini.
                </div>
              )
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                Preview akan muncul setelah Anda memilih file.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[28px] border-white/80 bg-white/92 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-slate-950">
            {hasRejectedPreviousProof ? "Upload ulang bukti pembayaran" : "Upload bukti pembayaran"}
          </CardTitle>
          <p className="text-sm leading-6 text-slate-600">
            Bukti pembayaran akan diverifikasi manual oleh vendor.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <input type="hidden" {...register("bookingId")} />
            <input type="hidden" {...register("paymentTermId")} />

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nominal pembayaran</label>
              <Input
                {...register("amount", { valueAsNumber: true })}
                type="number"
                min={1}
                className="h-11 rounded-2xl border-slate-200 bg-white text-slate-900"
              />
              <p className="text-xs text-slate-500">
                Nominal termin saat ini: {formatPaymentPrice(context.term.amount)}
              </p>
              {errors.amount ? <p className="text-xs text-rose-600">{errors.amount.message}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">File bukti pembayaran</label>
              <label className="flex cursor-pointer flex-col gap-2 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                <span>{fileLabel}</span>
                <span className="text-xs text-slate-500">Maksimal satu file sesuai format yang didukung.</span>
                <input
                  type="file"
                  accept={PAYMENT_PROOF_ACCEPT_ATTRIBUTE}
                  className="hidden"
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0];
                    setSelectedFile(nextFile ?? null);
                  }}
                />
              </label>
              {errors.file ? <p className="text-xs text-rose-600">{errors.file.message}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Catatan</label>
              <textarea
                {...register("note")}
                rows={4}
                placeholder="Opsional"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-rose-300"
              />
            </div>

            <div className="rounded-3xl bg-slate-950 px-5 py-4 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Ringkasan upload</p>
              <p className="mt-1 text-2xl font-semibold">{formatPaymentPrice(amount || 0)}</p>
              <p className="mt-2 text-sm text-slate-300">
                Setelah dikirim, status termin akan berubah menjadi menunggu verifikasi.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-2xl bg-rose-600 text-white hover:bg-rose-700"
            >
              {isSubmitting ? "Mengunggah..." : hasRejectedPreviousProof ? "Upload ulang bukti" : "Upload bukti"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
