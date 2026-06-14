import { RegisterForm } from "@/modules/auth/components/register-form";
import { AuthHero } from "@/modules/auth/components/auth-hero";
import { requireUserRouteAccess } from "@/modules/auth/services/require-user-route-access";

export default async function RegisterPage() {
  await requireUserRouteAccess("auth");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,113,133,0.18),_transparent_28%),linear-gradient(160deg,_#fff7ed_0%,_#fff1f2_55%,_#ffffff_100%)]">
      <div className="mx-auto grid min-h-screen max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
        <AuthHero
          eyebrow="Start Planning"
          title="Buat akun dan mulai kelola vendor impian untuk hari pernikahan Anda."
          description="Registrasi hanya butuh beberapa langkah. Setelah itu Anda bisa booking vendor, unggah pembayaran, dan memantau progres acara."
        />
        <div className="flex justify-center lg:justify-end">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
