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
  const type = searchParams.get('type');

  if (!type) {
    return NextResponse.json({ error: 'Type requis' }, { status: 400 });
  }

  try {
    let conversations: any[] = [];

    if (type === 'referent-vendeur') {
      // Récupérer toutes les paires référent-vendeur basées sur referentId
      const vendeurs = await prisma.user.findMany({
        where: {
          role: 'VENDEUR',
          referentId: { not: null }
        },
        select: {
          id: true,
          email: true,
          avatar: true,
          referentId: true,
          referent: {
            select: {
              id: true,
              email: true,
              avatar: true,
              phone: true,
            }
          }
        },
      });

      for (const vendeur of vendeurs) {
        if (vendeur.referent) {
          const messageCount = await prisma.message.count({
            where: {
              OR: [
                { fromUserId: vendeur.referent.id, toUserId: vendeur.id },
                { fromUserId: vendeur.id, toUserId: vendeur.referent.id },
              ],
            },
          });

          conversations.push({
            user1: vendeur.referent,
            user2: { id: vendeur.id, email: vendeur.email, avatar: vendeur.avatar },
            messageCount,
          });
        }
      }
    } else if (type === 'referent-backoffice') {
      // Récupérer toutes les paires référent-backoffice qui ont échangé des messages
      const referents = await prisma.user.findMany({
        where: { role: 'REFERENT' },
        select: { id: true, email: true, avatar: true, phone: true },
      });

      const backofficeUsers = await prisma.user.findMany({
        where: { role: },
        select: { id: true, email: true, avatar: true, phone: true },
      });

      for (const referent of referents) {
        for (const backoffice of backofficeUsers) {
          const messageCount = await prisma.message.count({
            where: {
              OR: [
                { fromUserId: referent.id, toUserId: backoffice.id },
                { fromUserId: backoffice.id, toUserId: referent.id },
              ],
            },
          });

          if (messageCount > 0) {
            conversations.push({
              user1: referent,
              user2: backoffice,
              messageCount,
            });
          }
        }
      }
    } else if (type === 'backoffice-vendeur') {
      // Récupérer toutes les paires backoffice-vendeur qui ont échangé des messages
      const backofficeUsers = await prisma.user.findMany({
        where: { role: },
        select: { id: true, email: true, avatar: true, phone: true },
      });

      const vendeurs = await prisma.user.findMany({
        where: { role: 'VENDEUR' },
        select: { id: true, email: true, avatar: true },
      });

      for (const backoffice of backofficeUsers) {
        for (const vendeur of vendeurs) {
          const messageCount = await prisma.message.count({
            where: {
              OR: [
                { fromUserId: backoffice.id, toUserId: vendeur.id },
                { fromUserId: vendeur.id, toUserId: backoffice.id },
              ],
            },
          });

          if (messageCount > 0) {
            conversations.push({
              user1: backoffice,
              user2: vendeur,
              messageCount,
            });
          }
        }
      }
    }

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Erreur lors de la récupération des échanges:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
