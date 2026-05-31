import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { createVendorAuthUseCases } from "@/core/infrastructure/http/vendor-auth-factory";

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
        const { authenticateVendorUseCase } = createVendorAuthUseCases();
        const user = await authenticateVendorUseCase.execute(email, password);

        if (!user) return null;

        return {
          id: user.userId,
          email: user.email,
          name: user.ownerName,
          role: user.role,
          vendorId: user.vendorId,
          vendorStatus: user.vendorStatus,
        };
      },
    }),
  ],
});
