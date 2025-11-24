import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Manus Fisio - Gestão Clínica Inteligente",
  description: "Sistema avançado de gestão para clínicas de fisioterapia",
};

import { PWAInit } from "@/components/pwa-init";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={cn(inter.className, "bg-background min-h-screen antialiased overflow-hidden")}>
        <PWAInit />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
