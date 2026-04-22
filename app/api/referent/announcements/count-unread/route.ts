import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ count: 0 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, referentId: true },
  });
  if (!user?.referentId) return NextResponse.json({ count: 0 });

  const total = await prisma.referentAnnouncement.count({ where: { referentId: user.referentId } });
  const readCount = await prisma.announcementRead.count({
    where: { userId: user.id, announcement: { referentId: user.referentId } },
  });

  return NextResponse.json({ count: total - readCount });
}
