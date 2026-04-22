import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ ok: false });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { lastPerformancesVisit: new Date() },
  });

  return NextResponse.json({ ok: true });
}
