import { LoginForm } from "@/modules/auth/components/login-form";
import { requireVendorRouteAccess } from "@/modules/auth/services/require-vendor-route-access";

export default async function LoginPage() {
  await requireVendorRouteAccess("auth");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#164e63_0%,#020617_58%,#020617_100%)] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">
            Wedding Organizer
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Portal Vendor</h1>
          <p className="mt-2 text-sm text-slate-400">
            Masuk untuk mengelola profil bisnis dan persiapan verifikasi.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
