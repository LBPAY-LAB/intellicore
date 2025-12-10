import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { KeycloakProvider } from '@/lib/keycloak/KeycloakProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SuperCore - Core Banking Platform',
  description: '100% AI-Based Core Banking Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <KeycloakProvider>
          {children}
        </KeycloakProvider>
      </body>
    </html>
  );
}
