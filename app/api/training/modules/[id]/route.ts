import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer le contenu complet d'un module (avec vérification de sécurité)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const moduleId = params.id;

  try {
    // Récupérer le module
    const trainingModule = await prisma.trainingModule.findUnique({
      where: { id: moduleId },
    });

    if (!trainingModule) {
      return NextResponse.json({ error: 'Module introuvable' }, { status: 404 });
    }

    // SÉCURITÉ : Vérifier le statut de progression si l'utilisateur est VENDEUR
    if (session.user.role === 'VENDEUR') {
      const progress = await prisma.trainingProgress.findUnique({
        where: {
          sellerId_moduleId: {
            sellerId: session.user.id,
            moduleId: moduleId,
          },
        },
      });

      // Si le module est LOCKED, refuser l'accès au contenu
      if (!progress || progress.status === 'LOCKED') {
        return NextResponse.json(
          { error: 'Ce module est verrouillé. Contactez votre référent pour le déverrouiller.' },
          { status: 403 }
        );
      }

      // Si le statut est UNLOCKED et que l'utilisateur accède au contenu, passer à IN_PROGRESS
      if (progress.status === 'UNLOCKED') {
        await prisma.trainingProgress.update({
          where: { id: progress.id },
          data: {
            status: 'IN_PROGRESS',
            startedAt: new Date(),
          },
        });
      }
    }

    // REFERENT et ADMIN ont accès à tout
    return NextResponse.json({ module: trainingModule });
  } catch (error) {
    console.error('Erreur lors de la récupération du module:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
