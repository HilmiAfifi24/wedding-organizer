import "server-only";

import { UserStatus } from "@wo/shared-types";
import { redirect } from "next/navigation";

import { USER_AUTH_ROUTES } from "@/modules/auth/constants/routes";
import { getCurrentUserSession } from "@/modules/auth/services/current-user-session";

type UserRouteKind = "auth" | "protected" | "suspended";

const resolveLandingPath = (status: UserStatus) =>
  status === UserStatus.SUSPENDED
    ? USER_AUTH_ROUTES.suspended
    : USER_AUTH_ROUTES.dashboard;

export function requireUserRouteAccess(routeKind: "auth"): Promise<null>;
export function requireUserRouteAccess(
  routeKind: Exclude<UserRouteKind, "auth">
): Promise<import("@wo/shared-types").UserSessionDTO>;
export async function requireUserRouteAccess(routeKind: UserRouteKind) {
  const session = await getCurrentUserSession();

  if (!session) {
    if (routeKind === "auth") {
      return null;
    }

    redirect(USER_AUTH_ROUTES.login);
  }

  if (routeKind === "auth") {
    redirect(resolveLandingPath(session.status));
  }

  if (routeKind === "protected") {
    if (session.status === UserStatus.SUSPENDED) {
      redirect(USER_AUTH_ROUTES.suspended);
    }

    return session;
  }

  if (session.status === UserStatus.SUSPENDED) {
    return session;
  }

  redirect(resolveLandingPath(session.status));
}
