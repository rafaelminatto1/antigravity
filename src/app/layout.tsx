import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Manus Fisio - Gestão Clínica Inteligente",
  description: "Sistema avançado de gestão para clínicas de fisioterapia",
};

import { PWAInit } from "@/components/pwa-init";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/lib/providers/QueryProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={cn("bg-background min-h-screen antialiased overflow-hidden")}>
        <QueryProvider>
          <PWAInit />
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
