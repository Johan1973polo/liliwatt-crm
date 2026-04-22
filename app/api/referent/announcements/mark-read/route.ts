import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ ok: false });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, referentId: true },
  });
  if (!user?.referentId) return NextResponse.json({ ok: false });

  const announcements = await prisma.referentAnnouncement.findMany({
    where: { referentId: user.referentId },
    select: { id: true },
  });

  for (const ann of announcements) {
    await prisma.announcementRead.upsert({
      where: { announcementId_userId: { announcementId: ann.id, userId: user.id } },
      create: { announcementId: ann.id, userId: user.id },
      update: {},
    });
  }

  return NextResponse.json({ ok: true, marked: announcements.length });
}
