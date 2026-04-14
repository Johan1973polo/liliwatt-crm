import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Mettre à jour le contenu d'un module spécifique
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { order, content } = body;

    if (!order || !content) {
      return NextResponse.json({ error: 'order et content requis' }, { status: 400 });
    }

    // Trouver le module par son ordre
    const existingModule = await prisma.trainingModule.findFirst({
      where: { order: order },
    });

    if (!existingModule) {
      return NextResponse.json({ error: 'Module non trouvé' }, { status: 404 });
    }

    // Mettre à jour le contenu
    const updatedModule = await prisma.trainingModule.update({
      where: { id: existingModule.id },
      data: { content: content },
    });

    return NextResponse.json({
      success: true,
      module: {
        id: updatedModule.id,
        order: updatedModule.order,
        title: updatedModule.title,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du module:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
