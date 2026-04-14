import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    // Marquer uniquement les notifications de PERFORMANCES non lues comme lues
    // Les messages seront marqués lus dans leur propre page
    const result = await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        isRead: false,
        kind: { in: ['SALE_MADE', 'INVOICE_RECEIVED'] },
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({
      success: true,
      markedCount: result.count,
    });
  } catch (error) {
    console.error('Erreur lors du marquage des notifications:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
