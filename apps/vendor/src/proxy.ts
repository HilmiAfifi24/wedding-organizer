import { auth } from "@/auth";
import {
  VENDOR_AUTH_ROUTES,
  VENDOR_PROTECTED_PATHS,
} from "@/modules/auth/constants/routes";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/public");

  if (isPublicAsset || pathname.startsWith("/api/auth")) {
    return;
  }

  const isProtectedPath = VENDOR_PROTECTED_PATHS.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isProtectedPath) {
    return;
  }

  if (!req.auth) {
    return Response.redirect(new URL(VENDOR_AUTH_ROUTES.login, req.nextUrl.origin));
  }

  const role = (req.auth.user as { role?: string } | undefined)?.role;
  if (role !== "VENDOR") {
    return Response.redirect(new URL(VENDOR_AUTH_ROUTES.unauthorized, req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
