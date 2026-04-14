import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT - Mettre à jour la progression d'un module
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const body = await request.json();
  const { moduleId, status, score, internalNote, sellerId } = body;

  if (!moduleId || !status) {
    return NextResponse.json({ error: 'moduleId et status requis' }, { status: 400 });
  }

  // Valider le statut
  const validStatuses = ['LOCKED', 'UNLOCKED', 'IN_PROGRESS', 'COMPLETED'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
  }

  try {
    // Déterminer quel vendeur mettre à jour
    let targetSellerId = session.user.id;

    // Si un sellerId est spécifié, vérifier que l'utilisateur a les permissions
    if (sellerId) {
      if (!['ADMIN', 'REFERENT'].includes(session.user.role)) {
        return NextResponse.json(
          { error: 'Seuls les référents et admins peuvent modifier la progression d\'autres utilisateurs' },
          { status: 403 }
        );
      }
      targetSellerId = sellerId;
    } else {
      // Si pas de sellerId spécifié, seul VENDEUR peut mettre à jour sa propre progression
      // Pour marquer comme COMPLETED
      if (session.user.role !== 'VENDEUR' && status === 'COMPLETED') {
        return NextResponse.json({ error: 'Action non autorisée' }, { status: 403 });
      }
    }

    // Récupérer ou créer la progression
    let progress = await prisma.trainingProgress.findUnique({
      where: {
        sellerId_moduleId: {
          sellerId: targetSellerId,
          moduleId: moduleId,
        },
      },
    });

    // Construire les données de mise à jour
    const updateData: any = { status };

    // Si le statut passe à COMPLETED, enregistrer la date
    if (status === 'COMPLETED' && (!progress || progress.status !== 'COMPLETED')) {
      updateData.completedAt = new Date();
    }

    // Si score fourni (REFERENT/ADMIN uniquement)
    if (score !== undefined && ['ADMIN', 'REFERENT'].includes(session.user.role)) {
      updateData.score = score;
    }

    // Si note interne fournie (REFERENT/ADMIN uniquement)
    if (internalNote !== undefined && ['ADMIN', 'REFERENT'].includes(session.user.role)) {
      updateData.internalNote = internalNote;
    }

    if (progress) {
      // Mettre à jour
      progress = await prisma.trainingProgress.update({
        where: { id: progress.id },
        data: updateData,
      });
    } else {
      // Créer (ne devrait normalement pas arriver, sauf si déverrouillage pas encore fait)
      progress = await prisma.trainingProgress.create({
        data: {
          sellerId: targetSellerId,
          moduleId: moduleId,
          ...updateData,
        },
      });
    }

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la progression:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
