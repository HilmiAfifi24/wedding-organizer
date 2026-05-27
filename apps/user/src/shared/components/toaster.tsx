"use client";

import * as React from "react";

import { ToastProvider, ToastViewport } from "@wo/ui-components";

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastViewport />
    </ToastProvider>
  );
}
