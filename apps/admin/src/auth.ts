import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { createAuthUseCases } from "@/core/infrastructure/auth/auth-use-case-factory";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { authenticateAdminUseCase } = createAuthUseCases();
        const user = await authenticateAdminUseCase.execute({
          email: String(credentials.email),
          password: String(credentials.password),
        });

        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          accessProfileId: user.accessProfileId,
        };
      },
    }),
  ],
});
