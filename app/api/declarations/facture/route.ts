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
  const { societe, type, notes } = body;

  if (!societe) {
    return NextResponse.json({ error: 'Nom de société requis' }, { status: 400 });
  }

  try {
    // Créer la déclaration
    const declaration = await prisma.declaration.create({
      data: {
        type: 'FACTURE',
        userId: session.user.id,
        societe,
        details: { energyType: type || 'electricite', notes: notes || '' },
      },
    });

    // Récupérer le vendeur pour son nom
    const vendeur = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { firstName: true, lastName: true, referentId: true, courtierNumber: true },
    });

    const prenom = vendeur?.firstName || session.user.email;
    const typeLabel = type === 'gaz' ? 'gaz' : 'électricité';

    // Notifier le référent
    if (vendeur?.referentId) {
      await prisma.notification.create({
        data: {
          userId: vendeur.referentId,
          kind: 'INVOICE_RECEIVED',
          entityId: declaration.id,
          metadata: JSON.stringify({
            message: `📄 ${prenom} a récupéré une facture ${typeLabel} de ${societe}`,
            vendeurName: prenom,
            societe,
          }),
        },
      });
    }

    // Notifier tous les admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          kind: 'INVOICE_RECEIVED',
          entityId: declaration.id,
          metadata: JSON.stringify({
            message: `📄 ${prenom} a récupéré une facture ${typeLabel} de ${societe}`,
            vendeurName: prenom,
            societe,
          }),
        },
      });
    }

    // Créer une activité d'équipe
    await prisma.teamActivity.create({
      data: {
        type: 'INVOICE',
        courtierNumber: vendeur?.courtierNumber || null,
        authorRole: 'VENDEUR',
        authorName: `${vendeur?.firstName || ''} ${vendeur?.lastName || ''}`.trim(),
        message: `a récupéré une facture ${typeLabel} de ${societe}`,
      },
    });

    return NextResponse.json({ success: true, declaration });
  } catch (error) {
    console.error('Erreur déclaration facture:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
