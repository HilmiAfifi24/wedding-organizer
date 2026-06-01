"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MediaType, type CategoryDTO, type VendorRegistrationInput } from "@wo/shared-types";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@wo/ui-components";
import { type Path, useForm } from "react-hook-form";

import {
  registerAccountStepSchema,
  registerPortfolioStepSchema,
  registerSchema,
  registerServiceStepSchema,
  type RegisterInput,
} from "../schemas/auth";

interface RegisterFormProps {
  categories: CategoryDTO[];
}

type RegisterStep = "account" | "service" | "portfolio";

const stepOrder: RegisterStep[] = ["account", "service", "portfolio"];

const stepLabels: Record<RegisterStep, string> = {
  account: "Pendaftaran",
  service: "Service Awal",
  portfolio: "Portfolio Awal",
};

const stepValidationFields: Record<RegisterStep, Path<RegisterInput>[]> = {
  account: [
    "ownerName",
    "email",
    "phoneNumber",
    "password",
    "confirmPassword",
    "businessName",
    "categoryId",
    "businessAddress",
    "city",
    "province",
  ],
  service: ["initialService.name", "initialService.description", "initialService.price"],
  portfolio: [
    "initialPortfolio.title",
    "initialPortfolio.description",
    "initialPortfolio.mediaUrl",
    "initialPortfolio.mediaType",
  ],
};

export function RegisterForm({ categories }: RegisterFormProps) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<RegisterStep>("account");
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(0);
  const [error, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasCategories = categories.length > 0;

  const {
    register,
    getValues,
    handleSubmit,
    setError: setFieldError,
    clearErrors,
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
      initialService: {
        name: "",
        description: "",
        price: 0,
        isActive: true,
      },
      initialPortfolio: {
        title: "",
        description: "",
        mediaUrl: "",
        mediaType: MediaType.IMAGE,
      },
    },
  });

  const validateCurrentStep = async (step: RegisterStep) => {
    try {
      clearErrors(stepValidationFields[step]);

      const result =
        step === "account"
          ? registerAccountStepSchema.safeParse({
              ownerName: getValues("ownerName"),
              email: getValues("email"),
              phoneNumber: getValues("phoneNumber"),
              password: getValues("password"),
              confirmPassword: getValues("confirmPassword"),
              businessName: getValues("businessName"),
              categoryId: getValues("categoryId"),
              businessAddress: getValues("businessAddress"),
              city: getValues("city"),
              province: getValues("province"),
            })
          : step === "service"
            ? registerServiceStepSchema.safeParse(getValues("initialService"))
            : registerPortfolioStepSchema.safeParse(getValues("initialPortfolio"));

      if (result.success) {
        return true;
      }

      for (const issue of result.error.issues) {
        const issuePath = issue.path.join(".");
        const fieldName =
          step === "account"
            ? issuePath
            : step === "service"
              ? `initialService.${issuePath}`
              : `initialPortfolio.${issuePath}`;

        setFieldError(fieldName as Path<RegisterInput>, {
          type: "manual",
          message: issue.message,
        });
      }

      return false;
    } catch {
      return false;
    }
  };

  const goToStep = async (targetStep: RegisterStep) => {
    const targetIndex = stepOrder.indexOf(targetStep);
    const currentIndex = stepOrder.indexOf(activeStep);

    if (targetIndex <= currentIndex) {
      setActiveStep(targetStep);
      return;
    }

    if (targetIndex > maxUnlockedStep + 1) {
      return;
    }

    const valid = await validateCurrentStep(activeStep);
    if (!valid) {
      return;
    }

    setMaxUnlockedStep((previous) => Math.max(previous, targetIndex));
    setActiveStep(targetStep);
  };

  const handleNext = async () => {
    const currentIndex = stepOrder.indexOf(activeStep);
    const nextStep = stepOrder[currentIndex + 1];

    if (!nextStep) {
      return;
    }

    const valid = await validateCurrentStep(activeStep);
    if (!valid) {
      return;
    }

    setMaxUnlockedStep((previous) => Math.max(previous, currentIndex + 1));
    setActiveStep(nextStep);
  };

  const handleBack = () => {
    const currentIndex = stepOrder.indexOf(activeStep);
    const previousStep = stepOrder[currentIndex - 1];

    if (previousStep) {
      setActiveStep(previousStep);
    }
  };

  const onSubmit = async (data: RegisterInput) => {
    setIsSubmitting(true);
    setFormError(null);
    setSuccess(null);

    try {
      const payload: VendorRegistrationInput = {
        ...data,
        initialService: {
          ...data.initialService,
          description: data.initialService.description?.trim() || undefined,
        },
        initialPortfolio: {
          ...data.initialPortfolio,
          title: data.initialPortfolio.title?.trim() || undefined,
          description: data.initialPortfolio.description?.trim() || undefined,
        },
      };

      const response = await fetch("/api/vendor/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => null)) as
        | { success: true; message: string }
        | { success: false; message?: string };

      if (!response.ok || !body?.success) {
        setFormError(body?.message || "Registrasi vendor gagal diproses.");
        return;
      }

      setSuccess("Registrasi berhasil. Mengarahkan ke onboarding vendor...");

      const loginResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (loginResult?.error) {
        setSuccess("Registrasi berhasil. Silakan login untuk melanjutkan onboarding vendor.");
        window.setTimeout(() => {
          router.push("/login");
        }, 1000);
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch {
      setFormError("Terjadi kesalahan saat mengirim pendaftaran vendor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-5xl border-white/10 bg-slate-950/75 text-slate-100 backdrop-blur">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-3xl">Registrasi Vendor</CardTitle>
            <CardDescription className="max-w-2xl text-slate-400">
              Lengkapi data akun, 1 layanan awal, dan 1 portfolio awal dalam satu alur.
              Setelah submit, akun vendor akan langsung masuk ke onboarding untuk final review.
            </CardDescription>
          </div>
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-sm text-cyan-100">
            <div className="font-medium">Alur 3 langkah</div>
            <div className="mt-1 text-cyan-100/80">
              1. Pendaftaran
              <br />
              2. Service awal
              <br />
              3. Portfolio awal
            </div>
          </div>
        </div>
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

          <Tabs
            value={activeStep}
            onValueChange={(value) => void goToStep(value as RegisterStep)}
            className="space-y-6"
          >
            <TabsList className="grid h-auto w-full grid-cols-1 gap-2 rounded-2xl bg-slate-900/80 p-2 md:grid-cols-3">
              {stepOrder.map((step, index) => (
                <TabsTrigger
                  key={step}
                  value={step}
                  disabled={index > maxUnlockedStep + 1 || isSubmitting}
                  className="flex items-center justify-start gap-3 rounded-xl px-4 py-3 text-left data-[state=active]:bg-cyan-400/20 data-[state=active]:text-cyan-100"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-slate-950/60 text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{stepLabels[step]}</span>
                    <span className="block text-xs text-slate-400">
                      {step === "account"
                        ? "Data akun & bisnis"
                        : step === "service"
                          ? "Minimal 1 layanan aktif"
                          : "Minimal 1 portfolio"}
                    </span>
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="account" className="space-y-6">
              <section className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
                    Account Information
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Ini akan menjadi akun utama owner vendor untuk masuk ke portal vendor.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Owner Name" error={errors.ownerName?.message}>
                    <Input
                      {...register("ownerName")}
                      className="border-white/10 bg-slate-900 text-slate-100"
                    />
                  </Field>
                  <Field label="Email" error={errors.email?.message}>
                    <Input
                      {...register("email")}
                      type="email"
                      className="border-white/10 bg-slate-900 text-slate-100"
                    />
                  </Field>
                  <Field label="Phone Number" error={errors.phoneNumber?.message}>
                    <Input
                      {...register("phoneNumber")}
                      placeholder="08xxxxxxxxxx / +628xxxxxxxxxx"
                      className="border-white/10 bg-slate-900 text-slate-100"
                    />
                  </Field>
                  <Field label="Password" error={errors.password?.message}>
                    <Input
                      {...register("password")}
                      type="password"
                      className="border-white/10 bg-slate-900 text-slate-100"
                    />
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

              <section className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
                    Business Information
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Data ini akan langsung menjadi fondasi onboarding vendor.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Business Name" error={errors.businessName?.message}>
                    <Input
                      {...register("businessName")}
                      className="border-white/10 bg-slate-900 text-slate-100"
                    />
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
                      rows={4}
                      className="flex w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                    />
                  </Field>
                  <Field label="City" error={errors.city?.message}>
                    <Input
                      {...register("city")}
                      className="border-white/10 bg-slate-900 text-slate-100"
                    />
                  </Field>
                  <Field label="Province" error={errors.province?.message}>
                    <Input
                      {...register("province")}
                      className="border-white/10 bg-slate-900 text-slate-100"
                    />
                  </Field>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="service" className="space-y-6">
              <section className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
                    Initial Service
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Tambahkan minimal 1 layanan aktif agar vendor langsung memenuhi checklist
                    verifikasi admin.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Service Name" error={errors.initialService?.name?.message}>
                    <Input
                      {...register("initialService.name")}
                      className="border-white/10 bg-slate-900 text-slate-100"
                    />
                  </Field>
                  <Field label="Price" error={errors.initialService?.price?.message}>
                    <Input
                      {...register("initialService.price", { valueAsNumber: true })}
                      type="number"
                      min={0}
                      className="border-white/10 bg-slate-900 text-slate-100"
                    />
                  </Field>
                  <Field
                    label="Description"
                    error={errors.initialService?.description?.message}
                    className="md:col-span-2"
                  >
                    <textarea
                      {...register("initialService.description")}
                      rows={4}
                      className="flex w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                    />
                  </Field>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="portfolio" className="space-y-6">
              <section className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
                    Initial Portfolio
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Tambahkan 1 contoh portfolio saat registrasi. Nanti vendor tetap bisa menambah
                    lebih banyak item setelah masuk onboarding.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Portfolio Title" error={errors.initialPortfolio?.title?.message}>
                    <Input
                      {...register("initialPortfolio.title")}
                      className="border-white/10 bg-slate-900 text-slate-100"
                    />
                  </Field>
                  <Field label="Media Type" error={errors.initialPortfolio?.mediaType?.message}>
                    <select
                      {...register("initialPortfolio.mediaType")}
                      className="flex h-10 w-full rounded-md border border-white/10 bg-slate-900 px-3 text-sm text-slate-100"
                    >
                      <option value={MediaType.IMAGE}>Image</option>
                      <option value={MediaType.VIDEO}>Video</option>
                    </select>
                  </Field>
                  <Field
                    label="Media URL"
                    error={errors.initialPortfolio?.mediaUrl?.message}
                    className="md:col-span-2"
                  >
                    <Input
                      {...register("initialPortfolio.mediaUrl")}
                      placeholder="https://example.com/portfolio-image.jpg"
                      className="border-white/10 bg-slate-900 text-slate-100"
                    />
                  </Field>
                  <Field
                    label="Description"
                    error={errors.initialPortfolio?.description?.message}
                    className="md:col-span-2"
                  >
                    <textarea
                      {...register("initialPortfolio.description")}
                      rows={4}
                      className="flex w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                    />
                  </Field>
                </div>
              </section>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-slate-400">
              Setelah submit, sistem akan membuat akun vendor, 1 service aktif, dan 1 portfolio
              awal, lalu langsung membawa vendor ke halaman onboarding.
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {activeStep !== "account" ? (
                <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>
                  Kembali
                </Button>
              ) : null}

              {activeStep !== "portfolio" ? (
                <Button type="button" onClick={() => void handleNext()} disabled={isSubmitting || !hasCategories}>
                  Lanjut
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting || !hasCategories}>
                  {isSubmitting ? "Mendaftarkan vendor..." : "Daftar & Masuk Onboarding"}
                </Button>
              )}
            </div>
          </div>
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
