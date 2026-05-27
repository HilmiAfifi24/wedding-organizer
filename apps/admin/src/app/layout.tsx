import type { Metadata } from "next";
import "./globals.css";
import { ToasterProvider } from "../shared/components/toaster";

export const metadata: Metadata = {
  title: "Wedding Organizer Admin",
  description: "Dashboard administrasi akses Wedding Organizer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ToasterProvider>{children}</ToasterProvider>
      </body>
    </html>
  );
}
