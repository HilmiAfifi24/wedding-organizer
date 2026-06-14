import { requireUserRouteAccess } from "@/modules/auth/services/require-user-route-access";
import { UserModulePlaceholder } from "@/shared/components/user-module-placeholder";
import { UserShell } from "@/shared/components/user-shell";

export default async function ReviewsPage() {
  const session = await requireUserRouteAccess("protected");

  return (
    <UserShell
      session={session}
      title="Review Saya"
      description="Lihat dan kelola review yang sudah Anda kirimkan untuk vendor setelah booking selesai."
    >
      <UserModulePlaceholder
        title="Reviews Workspace"
        description="Route review kini siap digunakan oleh customer yang sudah login dengan role USER."
        bullets={[
          "Review hanya akan tersedia untuk booking yang sudah selesai.",
          "Customer bisa meninjau ulang status review yang tampil atau disembunyikan admin.",
          "Middleware dan guard server memastikan rute ini tidak dapat diakses secara anonim.",
        ]}
      />
    </UserShell>
  );
}
