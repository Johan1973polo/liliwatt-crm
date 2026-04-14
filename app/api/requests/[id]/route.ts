import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { id } = params;
  const body = await request.json();
  const { status } = body;

  if (!status) {
    return NextResponse.json({ error: 'Statut requis' }, { status: 400 });
  }

  try {
    // Mettre à jour le statut de la demande
    const updatedRequest = await prisma.request.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la demande:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
