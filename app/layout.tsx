import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "TransX402 Next.js starter",
  description:
    "Fullstack Next.js starter with TransX402 gated JSON APIs and pay-once pages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
