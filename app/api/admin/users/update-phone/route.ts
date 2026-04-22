import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const { userId, phone } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: 'userId requis' }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { phone: phone?.trim() || null },
  });

  return NextResponse.json({ success: true, user: { id: updated.id, email: updated.email, phone: updated.phone } });
}
