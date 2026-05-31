import { redirect } from "next/navigation";

import { resolveVendorLandingPath } from "@/core/domain/entities/vendor-account";
import { getCurrentVendorSession } from "@/modules/auth/services/current-vendor-session";

export default async function VendorHomePage() {
  const session = await getCurrentVendorSession();

  if (!session) {
    redirect("/login");
  }

  redirect(resolveVendorLandingPath(session.vendorStatus));
}
