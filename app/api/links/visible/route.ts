import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ links: [], rgpdLink: null });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, referentId: true },
  });
  if (!user) return NextResponse.json({ links: [], rgpdLink: null });

  // Scopes globaux visibles selon le role
  const globalScopes = ['GLOBAL']; // visible par tous
  if (user.role === 'REFERENT') {
    globalScopes.push('GLOBAL_REFERENT');
  } else if (user.role === 'VENDEUR') {
    globalScopes.push('GLOBAL_VENDOR');
  } else if (user.role === 'ADMIN') {
    globalScopes.push('GLOBAL_REFERENT', 'GLOBAL_VENDOR');
  }

  const links = await prisma.link.findMany({
    where: {
      OR: [
        { scope: { in: globalScopes } },
        { scope: 'USER', userId: user.id },
        // Liens equipe du referent (pour les vendeurs)
        ...(user.referentId ? [{ scope: 'TEAM', teamReferentId: user.referentId }] : []),
      ],
    },
    orderBy: [{ scope: 'asc' }, { order: 'asc' }],
  });

  // Lien RGPD pour les vendeurs (stocke dans Credential serviceName=RGPD, login=url)
  let rgpdLink: string | null = null;
  if (user.role === 'VENDEUR') {
    const rgpdCred = await prisma.credential.findFirst({
      where: { userId: user.id, serviceName: 'RGPD' },
      select: { login: true },
    });
    if (rgpdCred) rgpdLink = rgpdCred.login;
  }

  return NextResponse.json({ links, rgpdLink });
}
