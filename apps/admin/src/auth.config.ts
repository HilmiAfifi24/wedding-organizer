import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // Will be populated in auth.ts
  session: {
    strategy: "jwt",
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
