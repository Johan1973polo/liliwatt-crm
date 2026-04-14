import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

  // Récupérer les vendeurs visibles selon le rôle
  let whereClause: any = { role: 'VENDEUR', isActive: true };

  if (session.user.role === 'VENDEUR') {
    // Vendeur voit ses collègues du même référent
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
  // ADMIN voit tous les vendeurs

  const vendeurs = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      lastSeen: true,
      isAvailable: true,
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
    isOnline: v.lastSeen ? v.lastSeen > twoMinutesAgo : false,
    isAvailable: v.isAvailable,
    lastSeen: v.lastSeen,
  }));

  return NextResponse.json(result);
}
