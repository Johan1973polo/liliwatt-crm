import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    // Récupérer tous les messages non lus reçus par l'utilisateur actuel
    const unreadMessages = await prisma.message.findMany({
      where: {
        toUserId: session.user.id,
        readAt: null,
      },
      select: {
        fromUserId: true,
      },
    });

    // Compter les messages par expéditeur
    const counts: Record<string, number> = {};
    unreadMessages.forEach((msg) => {
      counts[msg.fromUserId] = (counts[msg.fromUserId] || 0) + 1;
    });

    return NextResponse.json({ counts });
  } catch (error) {
    console.error('Erreur lors de la récupération des compteurs:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
