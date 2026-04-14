import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const body = await request.json();
  const { title, url, scope } = body;

  if (!title || !url) {
    return NextResponse.json(
      { error: 'Titre et URL requis' },
      { status: 400 }
    );
  }

  // Valider le scope
  const validScopes = ['GLOBAL', 'GLOBAL_REFERENT', 'GLOBAL_VENDOR'];
  const linkScope = scope && validScopes.includes(scope) ? scope : 'GLOBAL';

  try {
    // Récupérer le dernier ordre pour ce scope
    const lastLink = await prisma.link.findFirst({
      where: {
        scope: {
          in: ['GLOBAL', 'GLOBAL_REFERENT', 'GLOBAL_VENDOR']
        }
      },
      orderBy: { order: 'desc' },
    });

    const newOrder = lastLink ? lastLink.order + 1 : 1;

    const link = await prisma.link.create({
      data: {
        scope: linkScope,
        title,
        url,
        order: newOrder,
      },
    });

    return NextResponse.json({ success: true, link });
  } catch (error) {
    console.error('Erreur lors de la création du lien:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
