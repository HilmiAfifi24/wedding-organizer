import type { NextAuthConfig } from "next-auth";

const isSecureCookie = process.env.NODE_ENV === "production";

export const authConfig = {
  providers: [], // Will be populated in auth.ts
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: "vendor-authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isSecureCookie,
      },
    },
    callbackUrl: {
      name: "vendor-authjs.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: isSecureCookie,
      },
    },
    csrfToken: {
      name: "vendor-authjs.csrf-token",
      options: {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        secure: isSecureCookie,
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.vendorId = (user as { vendorId?: string }).vendorId;
        token.vendorStatus = (user as { vendorStatus?: string }).vendorStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.vendorId = token.vendorId as string;
        session.user.vendorStatus = token.vendorStatus as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
