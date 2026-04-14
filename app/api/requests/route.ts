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
  const { type, referentId, vendorId, payload } = body;

  if (!type || !referentId || !payload) {
    return NextResponse.json(
      { error: 'Type, référent et données requis' },
      { status: 400 }
    );
  }

  // Validation: INVOICE requiert un vendorId
  if (type === 'INVOICE' && !vendorId) {
    return NextResponse.json(
      { error: 'Le vendeur est requis pour une demande de facture' },
      { status: 400 }
    );
  }

  try {
    // Créer la demande
    const requestRecord = await prisma.request.create({
      data: {
        type,
        userId: session.user.id,
        referentId,
        vendorId: vendorId || null,
        status: 'NEW',
        payloadJson: JSON.stringify(payload),
      },
    });

    // Formater le message selon le type de demande
    let messageBody = '';

    if (type === 'DATA_BASE') {
      messageBody = `📊 DEMANDE DE BASE TÉLÉPRO\n\n${payload.description || 'Aucune description fournie'}`;
    } else if (type === 'FINANCIAL_RATING') {
      messageBody = `💰 DEMANDE DE NOTATION FINANCIÈRE\n\n` +
        `SIREN: ${payload.siren || 'Non renseigné'}\n` +
        `Raison sociale: ${payload.raisonSociale || 'Non renseignée'}\n` +
        (payload.commentaire ? `\nCommentaire: ${payload.commentaire}` : '');
    } else if (type === 'INVOICE') {
      messageBody = `🧾 DEMANDE DE FACTURE\n\n${JSON.stringify(payload, null, 2)}`;
    } else if (type === 'INTEGRATION') {
      messageBody = `🔗 DEMANDE D'INTÉGRATION\n\n${JSON.stringify(payload, null, 2)}`;
    } else if (type === 'PROBLEME_TECHNIQUE') {
      messageBody = `🔧 PROBLÈME TECHNIQUE\n\n${JSON.stringify(payload, null, 2)}`;
    } else if (type === 'SOUTIEN_TECHNIQUE') {
      messageBody = `🆘 SOUTIEN TECHNIQUE\n\n${JSON.stringify(payload, null, 2)}`;
    } else {
      messageBody = `📝 NOUVELLE DEMANDE (${type})\n\n${JSON.stringify(payload, null, 2)}`;
    }

    // Créer un message dans la messagerie du référent
    await prisma.message.create({
      data: {
        fromUserId: session.user.id,
        toUserId: referentId,
        body: messageBody,
        category: 'REFERENT', // Catégorie pour que ça apparaisse dans la messagerie du référent
      },
    });

    // Créer des notifications pour le référent
    await prisma.notification.create({
      data: {
        userId: referentId,
        kind: 'REQUEST',
        entityId: requestRecord.id,
        isRead: false,
      },
    });

    // Routing des notifications selon le type
    if (type === 'SOUTIEN_TECHNIQUE') {
      // SOUTIEN_TECHNIQUE → Notifier uniquement les ADMIN
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
      });

      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            kind: 'REQUEST',
            entityId: requestRecord.id,
            isRead: false,
          },
        });
      }
    } else {
      // Autres types → Notifier  et ADMIN
      const backOfficeAndAdmins = await prisma.user.findMany({
        where: {
          role: {
            in: [, 'ADMIN']
          }
        },
      });

      for (const user of backOfficeAndAdmins) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            kind: 'REQUEST',
            entityId: requestRecord.id,
            isRead: false,
          },
        });
      }
    }

    return NextResponse.json({ success: true, request: requestRecord });
  } catch (error) {
    console.error('Erreur lors de la création de la demande:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
