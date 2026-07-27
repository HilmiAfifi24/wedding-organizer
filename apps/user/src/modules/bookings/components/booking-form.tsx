"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@wo/ui-components";

import type { BookingFormProps } from "../types";
import type { CreateBookingInput } from "../schemas/create-booking";
import { createBookingSchema } from "../schemas/create-booking";
import { bookingsApi } from "../services/bookings-api";
import { getBookingDateInputMin } from "../services/event-date";
import { formatBookingPrice } from "../constants";
import { useToast } from "@/shared/components/toaster";

export function BookingForm({
  vendor,
  services,
  selectedServiceId,
  initialCustomer,
}: BookingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultServiceId =
    selectedServiceId && services.some((service) => service.id === selectedServiceId)
      ? selectedServiceId
      : services[0]?.id ?? "";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateBookingInput>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      vendorId: vendor.id,
      serviceId: defaultServiceId,
      eventDate: "",
      eventLocation: "",
      customerName: initialCustomer.customerName,
      customerPhone: initialCustomer.customerPhone,
      customerEmail: initialCustomer.customerEmail,
      guestCount: undefined,
      notes: "",
      specialRequest: "",
    },
  });

  const watchedServiceId = useWatch({
    control,
    name: "serviceId",
  });
  const selectedService = useMemo(
    () =>
      services.find((service) => service.id === watchedServiceId) ??
      services.find((service) => service.id === defaultServiceId) ??
      null,
    [defaultServiceId, services, watchedServiceId]
  );

  const [bookingType, setBookingType] = useState<"standard" | "custom">("standard");

  const onSubmit = async (values: CreateBookingInput) => {
    setError(null);

    if (bookingType === "custom") {
      const requestText = values.specialRequest?.trim() ?? "";
      if (requestText.length < 10) {
        setError("Detail kustomisasi wajib diisi minimal 10 karakter.");
        toast({
          title: "Validasi gagal",
          description: "Detail kustomisasi wajib diisi minimal 10 karakter.",
          variant: "error",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await bookingsApi.create({
        ...values,
        specialRequest: bookingType === "standard" ? undefined : values.specialRequest?.trim(),
      });

      toast({
        title: "Booking berhasil dibuat",
        description: "Menunggu konfirmasi dari vendor.",
      });
      router.push(`/bookings/${response.data.id}?created=1`);
      router.refresh();
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Terjadi kesalahan saat membuat booking.";

      setError(message);
      toast({
        title: "Booking gagal dibuat",
        description: message,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <Card className="rounded-[28px] border-white/80 bg-white/88 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-950">Ringkasan vendor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div>
              <p className="text-lg font-semibold text-slate-950">{vendor.businessName}</p>
              <p>
                {vendor.categoryName || "Kategori vendor"} · {[vendor.city, vendor.province]
                  .filter(Boolean)
                  .join(", ") || "Lokasi belum tersedia"}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Rating</p>
              <p className="mt-1 text-base font-semibold text-slate-950">
                {vendor.averageRating.toFixed(1)} / 5 ({vendor.totalReviews} review)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-white/80 bg-white/88 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-950">Ringkasan layanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            {selectedService ? (
              <>
                <div>
                  <p className="text-lg font-semibold text-slate-950">{selectedService.name}</p>
                  <p className="mt-1 leading-6">
                    {selectedService.description || "Vendor belum menambahkan deskripsi paket ini."}
                  </p>
                </div>
                <div className="rounded-3xl bg-rose-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-rose-500">Total awal</p>
                  <p className="mt-1 text-2xl font-semibold text-rose-600">
                    {formatBookingPrice(selectedService.price)}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Pembayaran offline akan dilakukan setelah vendor menyetujui booking.
                  </p>
                </div>
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-5">
                Belum ada layanan aktif yang bisa dibooking untuk vendor ini.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[28px] border-white/80 bg-white/92 shadow-[0_28px_90px_rgba(15,23,42,0.08)]">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-slate-950">Lengkapi detail booking</CardTitle>
          <p className="text-sm leading-6 text-slate-600">
            Setelah dikirim, status booking akan menjadi <span className="font-semibold">PENDING</span>.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <input type="hidden" {...register("vendorId")} />

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Pilih layanan</label>
              <select
                {...register("serviceId")}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-rose-300"
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {formatBookingPrice(service.price)}
                  </option>
                ))}
              </select>
              {errors.serviceId ? (
                <p className="text-xs text-rose-600">{errors.serviceId.message}</p>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Tanggal acara</label>
                <Input
                  {...register("eventDate")}
                  type="date"
                  min={getBookingDateInputMin()}
                  className="h-11 rounded-2xl border-slate-200 bg-white text-slate-900"
                />
                {errors.eventDate ? (
                  <p className="text-xs text-rose-600">{errors.eventDate.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Jumlah tamu</label>
                <Input
                  {...register("guestCount")}
                  type="number"
                  min={1}
                  placeholder="Opsional"
                  className="h-11 rounded-2xl border-slate-200 bg-white text-slate-900"
                />
                {errors.guestCount ? (
                  <p className="text-xs text-rose-600">{errors.guestCount.message}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Lokasi acara</label>
              <textarea
                {...register("eventLocation")}
                rows={3}
                placeholder="Contoh: Ballroom Hotel Mulia, Jakarta Selatan"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-rose-300"
              />
              {errors.eventLocation ? (
                <p className="text-xs text-rose-600">{errors.eventLocation.message}</p>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nama customer</label>
                <Input
                  {...register("customerName")}
                  type="text"
                  className="h-11 rounded-2xl border-slate-200 bg-white text-slate-900"
                />
                {errors.customerName ? (
                  <p className="text-xs text-rose-600">{errors.customerName.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nomor telepon</label>
                <Input
                  {...register("customerPhone")}
                  type="tel"
                  className="h-11 rounded-2xl border-slate-200 bg-white text-slate-900"
                />
                {errors.customerPhone ? (
                  <p className="text-xs text-rose-600">{errors.customerPhone.message}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email customer</label>
              <Input
                {...register("customerEmail")}
                type="email"
                className="h-11 rounded-2xl border-slate-200 bg-white text-slate-900"
              />
              {errors.customerEmail ? (
                <p className="text-xs text-rose-600">{errors.customerEmail.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Catatan</label>
              <textarea
                {...register("notes")}
                rows={3}
                placeholder="Detail singkat mengenai kebutuhan acara"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-rose-300"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Tipe Pemesanan / Paket</label>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setBookingType("standard")}
                  className={`flex flex-col rounded-2xl border p-4 text-left outline-none transition-all ${
                    bookingType === "standard"
                      ? "border-rose-500 bg-rose-50/50 ring-1 ring-rose-500"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className={`text-sm font-semibold ${bookingType === "standard" ? "text-rose-700" : "text-slate-900"}`}>
                    Paket Dasar (Standard)
                  </span>
                  <span className="mt-1 text-xs text-slate-500 leading-normal">
                    Menggunakan paket standar/dasar dari vendor tanpa penyesuaian khusus.
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setBookingType("custom")}
                  className={`flex flex-col rounded-2xl border p-4 text-left outline-none transition-all ${
                    bookingType === "custom"
                      ? "border-rose-500 bg-rose-50/50 ring-1 ring-rose-500"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className={`text-sm font-semibold ${bookingType === "custom" ? "text-rose-700" : "text-slate-900"}`}>
                    Kustom (Karakteristik Berbeda)
                  </span>
                  <span className="mt-1 text-xs text-slate-500 leading-normal">
                    Meminta penyesuaian/kustomisasi detail layanan sesuai kebutuhan Anda.
                  </span>
                </button>
              </div>
            </div>

            {bookingType === "custom" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Detail Permintaan Karakteristik Khusus <span className="text-rose-600">*</span>
                </label>
                <textarea
                  {...register("specialRequest")}
                  rows={3}
                  placeholder="Jelaskan karakteristik/kustomisasi berbeda yang Anda butuhkan secara detail (min. 10 karakter)..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-rose-300"
                />
                {errors.specialRequest ? (
                  <p className="text-xs text-rose-600">{errors.specialRequest.message}</p>
                ) : null}
              </div>
            )}

            <div className="rounded-3xl bg-slate-950 px-5 py-4 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Total booking</p>
              <p className="mt-1 text-2xl font-semibold">
                {formatBookingPrice(selectedService?.price ?? 0)}
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Booking berhasil dibuat. Menunggu konfirmasi dari vendor.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !selectedService}
              className="h-11 w-full rounded-2xl bg-rose-600 text-white hover:bg-rose-700"
            >
              {isSubmitting ? "Mengirim booking..." : "Kirim booking"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
