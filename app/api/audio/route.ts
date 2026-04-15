import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const audios = await prisma.audioFile.findMany({
    orderBy: [{ category: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      title: true,
      category: true,
      description: true,
      driveFileId: true,
      driveUrl: true,
      duration: true,
      createdAt: true,
    },
  });

  const grouped = {
    PROSPECTION: audios.filter((a) => a.category === 'PROSPECTION'),
    CLOSING: audios.filter((a) => a.category === 'CLOSING'),
  };

  return NextResponse.json(grouped);
}
