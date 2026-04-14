import type { Metadata } from 'next';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './globals.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SessionProvider from '@/components/SessionProvider';
import BootstrapClient from '@/components/BootstrapClient';

export const metadata: Metadata = {
  title: 'CRM Télévendeur - LILIWATT',
  description: 'Système de gestion pour télévendeurs',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="fr">
      <body>
        <SessionProvider session={session}>
          <BootstrapClient />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
