import Link from "next/link";
import { type UserSessionDTO } from "@wo/shared-types";
import { Button } from "@wo/ui-components";

import { USER_AUTH_ROUTES } from "@/modules/auth/constants/routes";

export function VendorBookingCta({
  vendorId,
  session,
}: {
  vendorId: string;
  session: UserSessionDTO | null;
}) {
  const bookingHref = `/vendors/${vendorId}/booking`;
  const href = session
    ? bookingHref
    : `${USER_AUTH_ROUTES.login}?callbackUrl=${encodeURIComponent(bookingHref)}`;

  const label = session ? "Lanjut ke Booking" : "Login untuk Booking";

  return (
    <Button asChild className="h-11 rounded-2xl bg-rose-600 text-white hover:bg-rose-700">
      <Link href={href}>{label}</Link>
    </Button>
  );
}
