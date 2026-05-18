import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beyond Platform Admin",
  description: "Console globale per il SaaS AI Avatar realtime.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="h-full dark">
      <body className="min-h-full bg-black font-sans text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
