import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { decryptPassword } from '@/lib/crypto';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const credentials = await prisma.credential.findMany({
    where: { userId: session.user.id },
    orderBy: { serviceName: 'asc' },
  });

  // Extraire le lien RGPD et le mot de passe Zoho
  let lienRgpd = '';
  let zohoPassword = '';

  for (const cred of credentials) {
    if (cred.serviceName === 'RGPD') {
      lienRgpd = cred.login; // Le login contient le lien RGPD
    }
    if (cred.serviceName === 'Zoho Mail') {
      try {
        zohoPassword = decryptPassword(cred.passwordEncrypted);
      } catch {
        zohoPassword = '';
      }
    }
  }

  return NextResponse.json({
    lienRgpd,
    zohoPassword,
    email: session.user.email,
    credentials: credentials.map((c) => ({
      id: c.id,
      serviceName: c.serviceName,
      login: c.login,
    })),
  });
}
