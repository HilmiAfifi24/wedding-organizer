import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AccessControlDashboard } from "@/modules/access-control/components/access-control-dashboard";
import { AdminLayout } from "@/shared/components/admin-layout";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <AdminLayout user={session.user}>
      <AccessControlDashboard />
    </AdminLayout>
  );
}
