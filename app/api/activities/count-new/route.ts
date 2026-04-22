import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ count: 0 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { lastPerformancesVisit: true },
  });

  const lastVisit = user?.lastPerformancesVisit || new Date(0);
  const count = await prisma.teamActivity.count({ where: { createdAt: { gt: lastVisit } } });

  return NextResponse.json({ count });
}
