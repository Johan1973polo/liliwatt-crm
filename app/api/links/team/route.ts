import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'REFERENT') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const body = await request.json();
  const { title, url } = body;

  if (!title || !url) {
    return NextResponse.json(
      { error: 'Titre et URL requis' },
      { status: 400 }
    );
  }

  try {
    // Récupérer le dernier ordre pour ce référent
    const lastLink = await prisma.link.findFirst({
      where: {
        scope: 'TEAM',
        teamReferentId: session.user.id,
      },
      orderBy: { order: 'desc' },
    });

    const newOrder = lastLink ? lastLink.order + 1 : 1;

    const link = await prisma.link.create({
      data: {
        scope: 'TEAM',
        title,
        url,
        teamReferentId: session.user.id,
        order: newOrder,
      },
    });

    return NextResponse.json({ success: true, link });
  } catch (error) {
    console.error('Erreur lors de la création du lien:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
