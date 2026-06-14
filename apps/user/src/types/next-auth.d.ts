import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      userId: string;
      fullName?: string | null;
      phoneNumber?: string | null;
      role: string;
      status: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    phoneNumber?: string | null;
    status?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    userId: string;
    fullName?: string | null;
    phoneNumber?: string | null;
    role: string;
    status: string;
  }
}
