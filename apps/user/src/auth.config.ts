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
      name: "user-authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isSecureCookie,
      },
    },
    callbackUrl: {
      name: "user-authjs.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: isSecureCookie,
      },
    },
    csrfToken: {
      name: "user-authjs.csrf-token",
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
        token.userId = user.id;
        token.id = user.id;
        token.fullName = user.name;
        token.phoneNumber = (user as { phoneNumber?: string }).phoneNumber;
        token.role = user.role;
        token.status = (user as { status?: string }).status;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.userId = token.userId as string;
        session.user.id = token.id as string;
        session.user.fullName = token.fullName as string;
        session.user.phoneNumber = token.phoneNumber as string | undefined;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
        session.user.name = token.fullName as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
