import React from "react";
import { RegisterForm } from "@/modules/auth/components/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-50 via-zinc-50 to-orange-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="mb-4 text-center">
        <h2 className="text-3xl font-extrabold text-amber-600 tracking-tight dark:text-amber-400">
          Wedding Organizer
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Portal Vendor
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
