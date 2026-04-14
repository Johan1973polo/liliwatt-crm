import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const otherUserId = searchParams.get('otherUserId');
  const category = searchParams.get('category');

  if (!otherUserId) {
    return NextResponse.json({ error: 'otherUserId requis' }, { status: 400 });
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { fromUserId: session.user.id, toUserId: otherUserId },
          { fromUserId: otherUserId, toUserId: session.user.id },
        ],
        // Filtrer par catégorie si fournie
        ...(category && { category }),
      },
      orderBy: { createdAt: 'asc' },
      include: {
        from: { select: { email: true, role: true, avatar: true } },
        to: { select: { email: true, role: true, avatar: true } },
      },
    });

    // Récupérer les IDs des messages non lus AVANT de les marquer
    const unreadMessages = await prisma.message.findMany({
      where: {
        fromUserId: otherUserId,
        toUserId: session.user.id,
        readAt: null,
        ...(category && { category }),
      },
      select: { id: true },
    });

    const unreadMessageIds = unreadMessages.map(m => m.id);

    // Marquer comme lus tous les messages reçus non lus
    if (unreadMessageIds.length > 0) {
      await prisma.message.updateMany({
        where: {
          id: { in: unreadMessageIds },
        },
        data: {
          readAt: new Date(),
        },
      });

      // Marquer les notifications MESSAGE correspondantes comme lues
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          kind: 'MESSAGE',
          entityId: { in: unreadMessageIds },
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const body = await request.json();
  const { toUserId, body: messageBody, category } = body;

  if (!toUserId || !messageBody) {
    return NextResponse.json(
      { error: 'Destinataire et message requis' },
      { status: 400 }
    );
  }

  try {
    // Créer le message avec catégorie
    const message = await prisma.message.create({
      data: {
        fromUserId: session.user.id,
        toUserId,
        body: messageBody,
        category: category || null,
      },
    });

    // Créer une notification pour le destinataire seulement
    await prisma.notification.create({
      data: {
        userId: toUserId,
        kind: 'MESSAGE',
        entityId: message.id,
        isRead: false,
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Erreur lors de la création du message:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
