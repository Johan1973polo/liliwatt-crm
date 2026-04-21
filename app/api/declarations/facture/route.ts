import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const declaration = await prisma.declaration.create({
      data: {
        type: 'FACTURE',
        userId: session.user.id,
        societe: 'Facture récupérée',
        details: {},
      },
    });

    const vendeur = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { firstName: true, lastName: true, referentId: true, courtierNumber: true },
    });

    const prenom = vendeur?.firstName || session.user.email;

    // Notifier le référent
    if (vendeur?.referentId) {
      await prisma.notification.create({
        data: {
          userId: vendeur.referentId,
          kind: 'INVOICE_RECEIVED',
          entityId: declaration.id,
          metadata: JSON.stringify({ message: `📄 ${prenom} a récupéré une facture !`, vendeurName: prenom }),
        },
      });
    }

    // Notifier les admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          kind: 'INVOICE_RECEIVED',
          entityId: declaration.id,
          metadata: JSON.stringify({ message: `📄 ${prenom} a récupéré une facture !`, vendeurName: prenom }),
        },
      });
    }

    // Activité d'équipe
    await prisma.teamActivity.create({
      data: {
        type: 'INVOICE',
        courtierNumber: vendeur?.courtierNumber || null,
        authorRole: session.user.role,
        authorName: `${vendeur?.firstName || ''} ${vendeur?.lastName || ''}`.trim(),
        message: `a récupéré une facture !`,
      },
    });

    return NextResponse.json({ success: true, declaration });
  } catch (error) {
    console.error('Erreur déclaration facture:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
