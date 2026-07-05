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
    <html lang="en" className="dark h-full antialiased" style={{ colorScheme: "dark" }}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ToasterProvider>{children}</ToasterProvider>
      </body>
    </html>
  );
}
