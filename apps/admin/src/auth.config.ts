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
      name: "admin-authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isSecureCookie,
      },
    },
    callbackUrl: {
      name: "admin-authjs.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: isSecureCookie,
      },
    },
    csrfToken: {
      name: "admin-authjs.csrf-token",
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
        token.accessProfileId = (user as { accessProfileId?: string | null }).accessProfileId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.accessProfileId = (token.accessProfileId as string | null) ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
