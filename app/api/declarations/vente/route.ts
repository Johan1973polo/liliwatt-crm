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
  const { montant_commission } = body;

  if (!montant_commission || montant_commission <= 0) {
    return NextResponse.json({ error: 'Montant commission requis' }, { status: 400 });
  }

  try {
    const declaration = await prisma.declaration.create({
      data: {
        type: 'VENTE',
        userId: session.user.id,
        societe: 'Vente signée',
        details: { montant_commission },
      },
    });

    const vendeur = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { firstName: true, lastName: true, courtierNumber: true },
    });

    const prenom = vendeur?.firstName || session.user.email;
    const montantStr = Number(montant_commission).toFixed(0);

    // Notifier TOUTE l'équipe
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
            message: `🏆 ${prenom} a signé un client ! Commission : ${montantStr}€`,
            vendeurName: prenom,
            montant: montant_commission,
          }),
        },
      });
    }

    // Activité d'équipe
    await prisma.teamActivity.create({
      data: {
        type: 'SALE',
        amount: Math.round(montant_commission),
        courtierNumber: vendeur?.courtierNumber || null,
        authorRole: session.user.role,
        authorName: `${vendeur?.firstName || ''} ${vendeur?.lastName || ''}`.trim(),
        message: `a signé un client ! Commission : ${montantStr}€ 🏆`,
      },
    });

    return NextResponse.json({ success: true, declaration });
  } catch (error) {
    console.error('Erreur déclaration vente:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
