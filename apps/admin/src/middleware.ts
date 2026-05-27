import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isApiRoute = pathname.startsWith("/api/");
  const isAuthRoute = pathname.startsWith("/api/auth");
  const isLoginRoute = pathname === "/login";
  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/public");

  if (isAuthRoute || isPublicAsset) {
    return;
  }

  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as { role?: string } | undefined)?.role;

  if (!isLoggedIn) {
    if (isApiRoute) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!isLoginRoute) {
      return Response.redirect(new URL("/login", req.nextUrl.origin));
    }
    return;
  }

  if (role !== "ADMIN") {
    if (isApiRoute) {
      return Response.json(
        { success: false, message: "Forbidden: admin only" },
        { status: 403 }
      );
    }

    if (isLoginRoute) {
      return;
    }

    return Response.redirect(new URL("/login", req.nextUrl.origin));
  }

  if (isLoginRoute) {
    return Response.redirect(new URL("/", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
