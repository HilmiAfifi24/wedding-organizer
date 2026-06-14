import { redirect } from "next/navigation";

import { requireUserRouteAccess } from "@/modules/auth/services/require-user-route-access";

export default async function VendorBookingEntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUserRouteAccess("protected");

  const { id } = await params;
  const rawParams = await searchParams;
  const serviceId = typeof rawParams.serviceId === "string" ? rawParams.serviceId : undefined;

  redirect(
    `/bookings/create?vendorId=${encodeURIComponent(id)}${
      serviceId ? `&serviceId=${encodeURIComponent(serviceId)}` : ""
    }`
  );
}
