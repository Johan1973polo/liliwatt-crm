import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const body = await request.json();
  const { message, target } = body; // target: 'ALL', 'REFERENTS', 'VENDEURS'

  if (!message || !target) {
    return NextResponse.json({ error: 'Message et cible requis' }, { status: 400 });
  }

  try {
    // Récupérer les utilisateurs cibles
    let targetUsers;

    if (target === 'ALL') {
      targetUsers = await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true },
      });
    } else if (target === 'REFERENTS') {
      targetUsers = await prisma.user.findMany({
        where: { role: 'REFERENT', isActive: true },
        select: { id: true },
      });
    } else if (target === 'VENDEURS') {
      targetUsers = await prisma.user.findMany({
        where: { role: 'VENDEUR', isActive: true },
        select: { id: true },
      });
    } else {
      return NextResponse.json({ error: 'Cible invalide' }, { status: 400 });
    }

    // Créer les notifications ET les messages pour tous les utilisateurs cibles
    const notifications = targetUsers.map((user) => ({
      userId: user.id,
      kind: 'ADMIN_BROADCAST',
      entityId: session.user.id, // L'ID de l'admin qui envoie
      isRead: user.id === session.user.id, // Marquer comme lu pour l'émetteur
      metadata: JSON.stringify({
        adminEmail: session.user.email,
        message,
        target,
      }),
    }));

    await prisma.notification.createMany({
      data: notifications,
    });

    // Créer aussi des messages avec catégorie pour les vendeurs
    const messages = targetUsers
      .filter((user) => {
        // Vérifier si l'utilisateur est un vendeur
        // On doit récupérer le rôle pour ça
        return true; // On va créer pour tous et filtrer après
      })
      .map((user) => ({
        fromUserId: session.user.id,
        toUserId: user.id,
        body: message,
        category: null, // Sera défini après selon le rôle
      }));

    // Récupérer les rôles des utilisateurs pour définir la catégorie
    const usersWithRoles = await prisma.user.findMany({
      where: {
        id: { in: targetUsers.map(u => u.id) },
      },
      select: { id: true, role: true },
    });

    // Créer les messages avec la bonne catégorie
    for (const user of usersWithRoles) {
      if (user.role === 'VENDEUR') {
        await prisma.message.create({
          data: {
            fromUserId: session.user.id,
            toUserId: user.id,
            body: message,
            category: 'DIRECTION',
          },
        });
      } else {
        // Pour les autres rôles, pas de catégorie
        await prisma.message.create({
          data: {
            fromUserId: session.user.id,
            toUserId: user.id,
            body: message,
            category: null,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      count: notifications.length
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'annonce:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
