import React from "react";
import { LoginForm } from "@/modules/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center p-6 bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="mb-4 text-center animate-fade-in">
        <h2 className="text-3xl font-extrabold text-pink-600 tracking-tight dark:text-pink-400">
          Wedding Organizer
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Portal Client
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
