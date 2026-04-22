import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  await prisma.demande.updateMany({
    where: { targetEmail: session.user.email, readByReferent: false },
    data: { readByReferent: true, readAt: new Date(), status: 'READ' },
  });

  return NextResponse.json({ success: true });
}
