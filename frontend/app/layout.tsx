import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SuperCore - Plataforma Universal de Gestão de Objetos",
  description: "Meta-plataforma 100% genérica. Zero autenticação, Zero lógica de negócio hardcoded.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
