"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { Button } from "@wo/ui-components";

export function LogoutButton() {
  return (
    <Button
      variant="outline"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-indigo-400 border-slate-800 hover:bg-slate-900 bg-transparent hover:text-indigo-300"
    >
      Keluar Konsol
    </Button>
  );
}
