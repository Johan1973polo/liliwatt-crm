import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const user1Id = searchParams.get('user1Id');
  const user2Id = searchParams.get('user2Id');

  if (!user1Id || !user2Id) {
    return NextResponse.json(
      { error: 'user1Id et user2Id requis' },
      { status: 400 }
    );
  }

  try {
    // Récupérer tous les messages entre ces deux utilisateurs
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { fromUserId: user1Id, toUserId: user2Id },
          { fromUserId: user2Id, toUserId: user1Id },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        from: { select: { email: true, avatar: true } },
        to: { select: { email: true, avatar: true } },
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
