"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button, cn } from "@wo/ui-components";

import { USER_AUTH_ROUTES } from "../constants/routes";
import { authApi } from "../services/auth-api";
import { useToast } from "@/shared/components/toaster";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const { toast } = useToast();

  return (
    <Button
      variant="outline"
      onClick={async () => {
        try {
          await authApi.logout();
          toast({
            title: "Berhasil keluar",
            description: "Sampai jumpa lagi di dashboard Wedding Organizer.",
          });
          router.push(USER_AUTH_ROUTES.login);
          router.refresh();
        } catch (error) {
          toast({
            title: "Logout gagal",
            description:
              error instanceof Error ? error.message : "Terjadi kesalahan saat logout.",
            variant: "error",
          });
        }
      }}
      className={cn(
        "border-white/20 bg-white/10 text-white hover:bg-white/20",
        className
      )}
    >
      Keluar
    </Button>
  );
}
