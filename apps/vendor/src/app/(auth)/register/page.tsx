import { createVendorAuthUseCases } from "@/core/infrastructure/http/vendor-auth-factory";
import { RegisterForm } from "@/modules/auth/components/register-form";
import { requireVendorRouteAccess } from "@/modules/auth/services/require-vendor-route-access";

export default async function RegisterPage() {
  await requireVendorRouteAccess("auth");
  const { listVendorCategoriesUseCase } = createVendorAuthUseCases();
  const categories = await listVendorCategoriesUseCase.execute();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#164e63_0%,#020617_58%,#020617_100%)] px-4 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">
            Wedding Organizer
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Registrasi Vendor</h1>
          <p className="mt-2 text-sm text-slate-400">
            Buat akun vendor, isi service dan portfolio awal, lalu lanjutkan ke onboarding.
          </p>
        </div>
        <RegisterForm categories={categories} />
      </div>
    </div>
  );
}
