import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorise' }, { status: 403 });
  }

  const type = request.nextUrl.searchParams.get('type');
  if (!type) {
    return NextResponse.json({ error: 'Type requis' }, { status: 400 });
  }

  try {
    const conversations: any[] = [];

    if (type === 'referent-vendeur') {
      const vendeurs = await prisma.user.findMany({
        where: { role: 'VENDEUR', referentId: { not: null } },
        select: {
          id: true, email: true, avatar: true, referentId: true,
          referent: { select: { id: true, email: true, avatar: true, phone: true } },
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
    } else if (type === 'admin-referent') {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true, email: true, avatar: true, phone: true },
      });
      const referents = await prisma.user.findMany({
        where: { role: 'REFERENT' },
        select: { id: true, email: true, avatar: true, phone: true },
      });

      for (const admin of admins) {
        for (const referent of referents) {
          const messageCount = await prisma.message.count({
            where: {
              OR: [
                { fromUserId: admin.id, toUserId: referent.id },
                { fromUserId: referent.id, toUserId: admin.id },
              ],
            },
          });
          if (messageCount > 0) {
            conversations.push({ user1: admin, user2: referent, messageCount });
          }
        }
      }
    } else if (type === 'admin-vendeur') {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true, email: true, avatar: true, phone: true },
      });
      const vendeurs = await prisma.user.findMany({
        where: { role: 'VENDEUR' },
        select: { id: true, email: true, avatar: true },
      });

      for (const admin of admins) {
        for (const vendeur of vendeurs) {
          const messageCount = await prisma.message.count({
            where: {
              OR: [
                { fromUserId: admin.id, toUserId: vendeur.id },
                { fromUserId: vendeur.id, toUserId: admin.id },
              ],
            },
          });
          if (messageCount > 0) {
            conversations.push({ user1: admin, user2: vendeur, messageCount });
          }
        }
      }
    }

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Erreur lors de la recuperation des echanges:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
