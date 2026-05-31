import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ToasterProvider } from "../shared/components/toaster";

export const metadata: Metadata = {
  title: "WO Vendor Portal",
  description: "Vendor workspace for onboarding, services, portfolio, bookings, and payments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ToasterProvider>{children}</ToasterProvider>
      </body>
    </html>
  );
}
