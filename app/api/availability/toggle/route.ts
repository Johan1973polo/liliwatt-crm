import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Définir la disponibilité du vendeur
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'VENDEUR') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { isAvailable } = body;

    // Valider le paramètre
    if (typeof isAvailable !== 'boolean') {
      return NextResponse.json({ error: 'Paramètre isAvailable requis (boolean)' }, { status: 400 });
    }

    // Mettre à jour la disponibilité
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { isAvailable },
    });

    return NextResponse.json({
      success: true,
      isAvailable: updatedUser.isAvailable
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de disponibilité:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
