import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const body = await request.json();
  const { societe, fournisseur, segment } = body;

  if (!societe || !fournisseur) {
    return NextResponse.json({ error: 'Société et fournisseur requis' }, { status: 400 });
  }

  try {
    const declaration = await prisma.declaration.create({
      data: {
        type: 'VENTE',
        userId: session.user.id,
        societe,
        details: { fournisseur, segment: segment || 'C5' },
      },
    });

    const vendeur = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { firstName: true, lastName: true, courtierNumber: true },
    });

    const prenom = vendeur?.firstName || session.user.email;

    // Notifier TOUTE l'équipe (admins + référents + vendeurs)
    const allUsers = await prisma.user.findMany({
      where: { isActive: true, id: { not: session.user.id } },
      select: { id: true },
    });

    for (const user of allUsers) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          kind: 'SALE_MADE',
          entityId: declaration.id,
          metadata: JSON.stringify({
            message: `🏆 ${prenom} vient de signer ${societe} !`,
            vendeurName: prenom,
            societe,
            fournisseur,
          }),
        },
      });
    }

    // Créer une activité d'équipe
    await prisma.teamActivity.create({
      data: {
        type: 'SALE',
        courtierNumber: vendeur?.courtierNumber || null,
        authorRole: session.user.role,
        authorName: `${vendeur?.firstName || ''} ${vendeur?.lastName || ''}`.trim(),
        message: `vient de signer ${societe} chez ${fournisseur} (${segment || 'C5'}) !`,
      },
    });

    return NextResponse.json({ success: true, declaration });
  } catch (error) {
    console.error('Erreur déclaration vente:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
