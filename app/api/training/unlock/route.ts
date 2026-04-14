import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Déverrouiller un ou plusieurs modules pour un vendeur
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !['ADMIN', 'REFERENT'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const body = await request.json();
  const { sellerId, moduleIds, action } = body; // action: 'unlock' ou 'lock'

  if (!sellerId || !moduleIds || !Array.isArray(moduleIds)) {
    return NextResponse.json({ error: 'sellerId et moduleIds (array) requis' }, { status: 400 });
  }

  if (!action || !['unlock', 'lock'].includes(action)) {
    return NextResponse.json({ error: 'action doit être "unlock" ou "lock"' }, { status: 400 });
  }

  try {
    // Vérifier que le vendeur existe
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
    });

    if (!seller) {
      return NextResponse.json({ error: 'Vendeur introuvable' }, { status: 404 });
    }

    // Si REFERENT, vérifier qu'il s'agit bien d'un vendeur de son équipe
    if (session.user.role === 'REFERENT') {
      if (seller.referentId !== session.user.id) {
        return NextResponse.json(
          { error: 'Vous ne pouvez gérer que les vendeurs de votre équipe' },
          { status: 403 }
        );
      }
    }

    // Traiter chaque module
    const results = [];

    for (const moduleId of moduleIds) {
      // Vérifier que le module existe
      const trainingModule = await prisma.trainingModule.findUnique({
        where: { id: moduleId },
      });

      if (!trainingModule) {
        results.push({ moduleId, success: false, error: 'Module introuvable' });
        continue;
      }

      // Récupérer la progression existante
      const existingProgress = await prisma.trainingProgress.findUnique({
        where: {
          sellerId_moduleId: {
            sellerId: sellerId,
            moduleId: moduleId,
          },
        },
      });

      if (action === 'unlock') {
        // Déverrouiller le module
        if (existingProgress) {
          // Mettre à jour uniquement si actuellement LOCKED
          if (existingProgress.status === 'LOCKED') {
            await prisma.trainingProgress.update({
              where: { id: existingProgress.id },
              data: {
                status: 'UNLOCKED',
                unlockedBy: session.user.id,
                unlockedAt: new Date(),
              },
            });
            results.push({ moduleId, success: true, action: 'unlocked' });
          } else {
            results.push({ moduleId, success: false, error: 'Déjà déverrouillé ou en cours' });
          }
        } else {
          // Créer une nouvelle progression
          await prisma.trainingProgress.create({
            data: {
              sellerId: sellerId,
              moduleId: moduleId,
              status: 'UNLOCKED',
              unlockedBy: session.user.id,
              unlockedAt: new Date(),
            },
          });
          results.push({ moduleId, success: true, action: 'unlocked' });
        }
      } else if (action === 'lock') {
        // Verrouiller le module (remettre à LOCKED)
        if (existingProgress) {
          // Ne verrouiller que si pas encore COMPLETED
          if (existingProgress.status !== 'COMPLETED') {
            await prisma.trainingProgress.update({
              where: { id: existingProgress.id },
              data: {
                status: 'LOCKED',
                startedAt: null,
                completedAt: null,
              },
            });
            results.push({ moduleId, success: true, action: 'locked' });
          } else {
            results.push({ moduleId, success: false, error: 'Ne peut pas verrouiller un module complété' });
          }
        } else {
          // Rien à faire, déjà locked par défaut
          results.push({ moduleId, success: true, action: 'already_locked' });
        }
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Erreur lors du déverrouillage/verrouillage:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
