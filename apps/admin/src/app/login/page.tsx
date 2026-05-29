import React from "react";
import { LoginForm } from "@/modules/auth/components/login-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.role === "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center p-6 bg-slate-950">
      <div className="mb-6 text-center animate-fade-in">
        <h2 className="text-3xl font-extrabold text-indigo-500 tracking-tight">
          Wedding Organizer Admin
        </h2>
        <p className="text-sm text-slate-400">
          Control Panel
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
