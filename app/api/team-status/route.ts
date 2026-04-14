import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function timeAgo(lastSeen: Date | null): string {
  if (!lastSeen) return '';
  const diff = Math.floor((Date.now() - lastSeen.getTime()) / 1000);
  if (diff < 30) return 'En ligne';
  const mins = Math.floor(diff / 60);
  if (mins < 1) return 'il y a quelques secondes';
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.floor(hours / 24)}j`;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const threshold = new Date(Date.now() - 30 * 1000); // 30 secondes

  let whereClause: any = { role: 'VENDEUR', isActive: true };

  if (session.user.role === 'VENDEUR') {
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referentId: true },
    });
    if (currentUser?.referentId) {
      whereClause.referentId = currentUser.referentId;
    }
  } else if (session.user.role === 'REFERENT') {
    whereClause.referentId = session.user.id;
  }

  const vendeurs = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      lastSeen: true,
      courtierNumber: true,
    },
    orderBy: { firstName: 'asc' },
  });

  const result = vendeurs.map((v) => ({
    id: v.id,
    firstName: v.firstName,
    lastName: v.lastName,
    email: v.email,
    courtierNumber: v.courtierNumber,
    isOnline: v.lastSeen ? v.lastSeen > threshold : false,
    lastSeen: v.lastSeen,
    lastSeenAgo: timeAgo(v.lastSeen),
  }));

  return NextResponse.json(result);
}
