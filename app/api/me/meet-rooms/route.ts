import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ rooms: [] });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      firstName: true,
      linkVisio: true,
      referent: { select: { firstName: true, linkVisio: true } },
    },
  });

  const adminMeet = process.env.LILIWATT_ADMIN_MEET_URL || 'https://meet.google.com/uhs-vaco-jod';

  const rooms: any[] = [
    { type: 'admin', title: 'MEET LILIWATT', subtitle: 'Salon principal', url: adminMeet, icon: '🏢', color: '#059669' },
  ];

  if (user?.role === 'REFERENT' && user?.linkVisio) {
    rooms.push({ type: 'own', title: 'Mon salon', subtitle: `Salon de ${user.firstName}`, url: user.linkVisio, icon: '🎥', color: 'gradient' });
  } else if (user?.role === 'VENDEUR' && user?.referent?.linkVisio) {
    rooms.push({ type: 'referent', title: `Salon de ${user.referent.firstName}`, subtitle: `Rejoindre ${user.referent.firstName}`, url: user.referent.linkVisio, icon: '🎥', color: 'gradient' });
  }

  return NextResponse.json({ rooms });
}
