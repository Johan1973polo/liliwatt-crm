import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer tous les modules avec la progression de l'utilisateur
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const sellerId = searchParams.get('sellerId'); // Pour que REFERENT/ADMIN puisse voir la progression d'un vendeur

  try {
    // Déterminer quel utilisateur voir
    let targetUserId = session.user.id;

    // Si un sellerId est spécifié et que l'utilisateur est REFERENT/ADMIN
    if (sellerId && ['ADMIN', 'REFERENT'].includes(session.user.role)) {
      targetUserId = sellerId;
    }

    // Récupérer tous les modules
    const modules = await prisma.trainingModule.findMany({
      orderBy: { order: 'asc' },
    });

    // Récupérer la progression pour l'utilisateur ciblé
    const progress = await prisma.trainingProgress.findMany({
      where: { sellerId: targetUserId },
      include: {
        unlocker: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Créer un map moduleId -> progress
    const progressMap = new Map(progress.map(p => [p.moduleId, p]));

    // Enrichir les modules avec la progression
    const modulesWithProgress = modules.map(module => ({
      id: module.id,
      title: module.title,
      description: module.description,
      order: module.order,
      icon: module.icon,
      durationEstimated: module.durationEstimated,
      progress: progressMap.get(module.id) || {
        status: 'LOCKED',
        unlockedBy: null,
        unlockedAt: null,
        startedAt: null,
        completedAt: null,
        score: null,
      },
    }));

    return NextResponse.json({ modules: modulesWithProgress });
  } catch (error) {
    console.error('Erreur lors de la récupération des modules:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
