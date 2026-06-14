import { LoginForm } from "@/modules/auth/components/login-form";
import { AuthHero } from "@/modules/auth/components/auth-hero";
import { requireUserRouteAccess } from "@/modules/auth/services/require-user-route-access";

export default async function LoginPage() {
  await requireUserRouteAccess("auth");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,113,133,0.18),_transparent_28%),linear-gradient(160deg,_#fff7ed_0%,_#fff1f2_55%,_#ffffff_100%)]">
      <div className="mx-auto grid min-h-screen max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
        <AuthHero
          eyebrow="User Portal"
          title="Masuk untuk mengelola seluruh perjalanan booking pernikahan Anda."
          description="Lihat vendor favorit, pantau pembayaran, dan pastikan semua persiapan tetap on track dari satu dashboard."
        />
        <div className="flex justify-center lg:justify-end">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
