import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ count: 0 });

  const count = await prisma.message.count({
    where: { toUserId: session.user.id, readAt: null },
  });

  return NextResponse.json({ count });
}
