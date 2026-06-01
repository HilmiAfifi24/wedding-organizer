import "server-only";

import { redirect } from "next/navigation";
import { VendorStatus, type VendorSessionDTO } from "@wo/shared-types";

import { resolveVendorLandingPath } from "@/core/domain/entities/vendor-account";
import { VENDOR_AUTH_ROUTES } from "@/modules/auth/constants/routes";
import { getCurrentVendorSession } from "@/modules/auth/services/current-vendor-session";

type VendorRouteKind =
  | "protected"
  | "workspace"
  | "onboarding"
  | "rejected"
  | "suspended"
  | "auth";

export function requireVendorRouteAccess(routeKind: "auth"): Promise<null>;
export function requireVendorRouteAccess(
  routeKind: Exclude<VendorRouteKind, "auth">
): Promise<VendorSessionDTO>;
export async function requireVendorRouteAccess(routeKind: VendorRouteKind) {
  const currentSession = await getCurrentVendorSession();

  if (!currentSession) {
    if (routeKind === "auth") {
      return null;
    }

    redirect(VENDOR_AUTH_ROUTES.login);
  }

  if (routeKind === "auth") {
    redirect(resolveVendorLandingPath(currentSession.vendorStatus));
  }

  if (routeKind === "protected") {
    if (currentSession.vendorStatus === VendorStatus.APPROVED) {
      return currentSession;
    }

    redirect(resolveVendorLandingPath(currentSession.vendorStatus));
  }

  if (routeKind === "workspace") {
    if (currentSession.vendorStatus === VendorStatus.SUSPENDED) {
      redirect(VENDOR_AUTH_ROUTES.suspended);
    }

    return currentSession;
  }

  if (routeKind === "onboarding") {
    if (currentSession.vendorStatus === VendorStatus.SUSPENDED) {
      redirect(VENDOR_AUTH_ROUTES.suspended);
    }

    if (currentSession.vendorStatus === VendorStatus.APPROVED) {
      redirect(VENDOR_AUTH_ROUTES.dashboard);
    }

    return currentSession;
  }

  if (routeKind === "rejected") {
    if (currentSession.vendorStatus === VendorStatus.REJECTED) {
      return currentSession;
    }

    redirect(resolveVendorLandingPath(currentSession.vendorStatus));
  }

  if (currentSession.vendorStatus === VendorStatus.SUSPENDED) {
    return currentSession;
  }

  redirect(resolveVendorLandingPath(currentSession.vendorStatus));
}
