import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { createUserAuthUseCases } from "@/core/infrastructure/http/user-auth-factory";

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

        const email = String(credentials.email);
        const password = String(credentials.password);
        const { authenticateUserUseCase } = createUserAuthUseCases();
        const result = await authenticateUserUseCase.execute(email, password);

        if (!result.success) {
          return null;
        }

        return {
          id: result.session.userId,
          email: result.session.email,
          name: result.session.fullName,
          phoneNumber: result.session.phoneNumber,
          role: result.session.role,
          status: result.session.status,
        };
      },
    }),
  ],
});
