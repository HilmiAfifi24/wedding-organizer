"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { Button } from "@wo/ui-components";

export function LogoutButton() {
  return (
    <Button
      variant="outline"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-amber-600 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-900/50 dark:hover:bg-amber-950/30"
    >
      Keluar
    </Button>
  );
}
