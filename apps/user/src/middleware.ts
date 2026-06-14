import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import {
  USER_AUTH_ROUTES,
  USER_PROTECTED_ROUTE_PREFIXES,
  USER_PUBLIC_ROUTES,
} from "@/modules/auth/constants/routes";
import { UserStatus } from "@wo/shared-types";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isApiRoute = pathname.startsWith("/api/");
  const isAuthRoute = pathname.startsWith("/api/auth");
  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/public");

  if (isAuthRoute || isApiRoute || isPublicAsset) {
    return;
  }

  const isProtectedRoute = USER_PROTECTED_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isVendorBookingRoute = /^\/vendors\/[^/]+\/booking(?:\/.*)?$/.test(pathname);
  const isPublicRoute = USER_PUBLIC_ROUTES.includes(
    pathname as (typeof USER_PUBLIC_ROUTES)[number]
  );
  const isSuspendedPage =
    pathname === USER_AUTH_ROUTES.suspended ||
    pathname.startsWith(`${USER_AUTH_ROUTES.suspended}/`);
  const isUnauthorizedPage = pathname === USER_AUTH_ROUTES.unauthorized;
  const isLoggedIn = Boolean(req.auth);
  const role = req.auth?.user?.role;
  const status = req.auth?.user?.status;

  if (!isLoggedIn) {
    if (isProtectedRoute || isVendorBookingRoute) {
      return Response.redirect(new URL(USER_AUTH_ROUTES.login, req.nextUrl.origin));
    }

    return;
  }

  if (role !== "USER") {
    if (isUnauthorizedPage) {
      return;
    }

    return Response.redirect(new URL(USER_AUTH_ROUTES.unauthorized, req.nextUrl.origin));
  }

  if (status === UserStatus.SUSPENDED) {
    if (isSuspendedPage) {
      return;
    }

    return Response.redirect(new URL(USER_AUTH_ROUTES.suspended, req.nextUrl.origin));
  }

  if (isPublicRoute || isUnauthorizedPage) {
    return Response.redirect(new URL(USER_AUTH_ROUTES.dashboard, req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
