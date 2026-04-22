import type { Metadata } from 'next';
import { Syne, Inter } from 'next/font/google';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './globals.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SessionProvider from '@/components/SessionProvider';
import BootstrapClient from '@/components/BootstrapClient';
import PingProvider from '@/components/PingProvider';

const syne = Syne({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Espace LILIWATT',
  description: 'Plateforme courtier énergie B2B',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="fr" className={`${syne.variable} ${inter.variable}`}>
      <body>
        <SessionProvider session={session}>
          <BootstrapClient />
          <PingProvider>
            {children}
          </PingProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
