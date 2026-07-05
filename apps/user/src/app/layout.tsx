import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ToasterProvider } from "../shared/components/toaster";

const geistSans = localFont({
  variable: "--font-geist-sans",
  src: [
    {
      path: "../../../../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
});

const geistMono = localFont({
  variable: "--font-geist-mono",
  src: [
    {
      path: "../../../../node_modules/next/dist/next-devtools/server/font/geist-mono-latin.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "Wedding Organizer User App",
  description: "Portal customer untuk booking vendor, pembayaran, dan review Wedding Organizer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col bg-[radial-gradient(circle_at_top,#172554_0%,#020617_48%,#020617_100%)] text-slate-100">
        <ToasterProvider>{children}</ToasterProvider>
      </body>
    </html>
  );
}
