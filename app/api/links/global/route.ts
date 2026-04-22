import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorise' }, { status: 403 });
  }

  const body = await request.json();
  const { title, url, scope, icon, subtitle } = body;

  if (!title || !url) {
    return NextResponse.json({ error: 'Titre et URL requis' }, { status: 400 });
  }

  const validScopes = ['GLOBAL', 'GLOBAL_REFERENT', 'GLOBAL_VENDOR'];
  const linkScope = scope && validScopes.includes(scope) ? scope : 'GLOBAL';

  try {
    const lastLink = await prisma.link.findFirst({
      where: { scope: { in: validScopes } },
      orderBy: { order: 'desc' },
    });

    const link = await prisma.link.create({
      data: {
        scope: linkScope,
        title,
        url,
        icon: icon || '🔗',
        subtitle: subtitle || null,
        order: lastLink ? lastLink.order + 1 : 1,
      },
    });

    return NextResponse.json({ success: true, link });
  } catch (error) {
    console.error('Erreur creation lien:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
