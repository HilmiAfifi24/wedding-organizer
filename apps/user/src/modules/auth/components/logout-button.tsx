"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { Button } from "@wo/ui-components";

export function LogoutButton() {
  return (
    <Button
      variant="outline"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-900/50 dark:hover:bg-rose-950/30"
    >
      Keluar
    </Button>
  );
}
