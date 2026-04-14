import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    // Récupérer la date de création de l'utilisateur pour filtrer l'historique
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { createdAt: true, role: true }
    });

    // Construire le filtre de date selon le rôle
    const whereClause: any = {
      type: { in: ['SALE', 'INVOICE'] }
    };

    // Si c'est un VENDEUR, filtrer les activités créées après sa date de création
    if (currentUser?.role === 'VENDEUR' && currentUser.createdAt) {
      whereClause.createdAt = {
        gte: currentUser.createdAt
      };
    }

    // Récupérer les 50 dernières activités (SALE et INVOICE uniquement)
    const activities = await prisma.teamActivity.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Récupérer tous les courtierNumbers uniques
    const courtierNumbers = [...new Set(activities.map(a => a.courtierNumber).filter(Boolean))];

    // Récupérer les prénoms correspondants
    const users = await prisma.user.findMany({
      where: {
        courtierNumber: { in: courtierNumbers as number[] }
      },
      select: {
        courtierNumber: true,
        firstName: true
      }
    });

    // Créer un map courtierNumber -> firstName
    const courtierMap = new Map(users.map(u => [u.courtierNumber, u.firstName]));

    // Enrichir les activités avec le firstName (priorité au fictionalFirstName)
    const enrichedActivities = activities.map(activity => ({
      ...activity,
      firstName: activity.fictionalFirstName || (activity.courtierNumber ? courtierMap.get(activity.courtierNumber) : null)
    }));

    return NextResponse.json({ activities: enrichedActivities });
  } catch (error) {
    console.error('Erreur lors de la récupération des activités:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const body = await request.json();
  const { type, amount, message, courtierNumber, fictionalFirstName, replyToId, mentionedCourtierNumber } = body;

  if (!type) {
    return NextResponse.json({ error: 'Type requis' }, { status: 400 });
  }

  try {
    // Deux cas de figure :
    // 1. MESSAGE : Tous les utilisateurs peuvent poster avec leur propre numéro
    // 2. Autres types (SALE, INVOICE, CUSTOM) : Uniquement ADMIN avec numéro manuel

    if (type === 'MESSAGE') {
      // Tout utilisateur connecté peut poster un message
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { courtierNumber: true, role: true, email: true }
      });

      if (!message || !message.trim()) {
        return NextResponse.json({ error: 'Message requis' }, { status: 400 });
      }

      // Vérifier si c'est une réponse valide
      if (replyToId) {
        const parentActivity = await prisma.teamActivity.findUnique({
          where: { id: replyToId }
        });

        if (!parentActivity) {
          return NextResponse.json({ error: 'Message parent introuvable' }, { status: 400 });
        }
      }

      // Déterminer le nom d'affichage selon le rôle
      let authorName = null;
      if (currentUser?.role === 'ADMIN') {
        authorName = 'Administration';
      } else if (currentUser?.role === 'REFERENT') {
        authorName = 'Référent';
      } else if (currentUser?.role ===) {
        authorName = 'Back-Office';
      }

      const activity = await prisma.teamActivity.create({
        data: {
          type: 'MESSAGE',
          amount: null,
          message: message.trim(),
          courtierNumber: currentUser?.courtierNumber || null,
          mentionedCourtierNumber: mentionedCourtierNumber ? parseInt(mentionedCourtierNumber) : null,
          authorRole: currentUser?.role || null,
          authorName: authorName,
          replyToId: replyToId || null,
          isManual: false, // Message normal d'un utilisateur réel
        }
      });

      return NextResponse.json({ success: true, activity });
    } else {
      // Création manuelle d'activité (SALE, INVOICE, CUSTOM) - Réservé aux ADMIN
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
      }

      if (!courtierNumber) {
        return NextResponse.json({ error: 'Numéro de courtier requis' }, { status: 400 });
      }

      // SÉCURITÉ : Vérifier que le numéro n'appartient PAS à un vrai vendeur
      const existingVendor = await prisma.user.findUnique({
        where: { courtierNumber: parseInt(courtierNumber) }
      });

      if (existingVendor) {
        return NextResponse.json({
          error: `⛔ Ce numéro appartient à un vrai vendeur (${existingVendor.email}). Choisissez un autre numéro.`
        }, { status: 400 });
      }

      const activity = await prisma.teamActivity.create({
        data: {
          type,
          amount: amount || null,
          message: message || null,
          courtierNumber: parseInt(courtierNumber),
          fictionalFirstName: fictionalFirstName || null,
          isManual: true, // Créé manuellement par l'admin
        }
      });

      return NextResponse.json({ success: true, activity });
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'activité:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 });
  }

  try {
    await prisma.teamActivity.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'activité:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
