import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer les événements du calendrier (avec cloisonnement)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Construction de la requête selon le rôle
    let whereClause: any = {};

    if (session.user.role === 'ADMIN') {
      // Admin voit TOUT
      whereClause = {};
    } else if (session.user.role === 'REFERENT') {
      // Référent voit: son agenda + agendas de SES vendeurs + agendas des ADMINS + agendas des autres RÉFÉRENTS
      const referentVendeurs = await prisma.user.findMany({
        where: {
          role: 'VENDEUR',
          referentId: session.user.id
        },
        select: { id: true }
      });

      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true }
      });

      const otherReferents = await prisma.user.findMany({
        where: {
          role: 'REFERENT',
          id: { not: session.user.id }
        },
        select: { id: true }
      });

      const vendeurIds = referentVendeurs.map(v => v.id);
      const adminIds = admins.map(a => a.id);
      const referentIds = otherReferents.map(r => r.id);

      whereClause = {
        userId: {
          in: [session.user.id, ...vendeurIds, ...adminIds, ...referentIds]
        }
      };
    } else if (session.user.role === 'VENDEUR') {
      // Vendeur voit: son agenda + agenda de SON référent
      const vendeur = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { referentId: true }
      });

      const userIds = [session.user.id];
      if (vendeur?.referentId) {
        userIds.push(vendeur.referentId);
      }

      whereClause = {
        userId: {
          in: userIds
        }
      };
    ;
    } else {
      // Rôle inconnu
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Filtres de dates si fournis
    if (startDate && endDate) {
      whereClause.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const events = await prisma.calendarEvent.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
            courtierNumber: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouvel événement
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Accès agenda vérifié

    const body = await request.json();
    const {
      userId, // ID du propriétaire de l'événement (peut être différent de session.user.id pour référent/admin)
      title,
      description,
      eventType,
      color,
      startTime,
      endTime,
      isAllDay,
      attendeeIds
    } = body;

    // Validation
    if (!title || !eventType || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Vérifier les permissions
    const targetUserId = userId || session.user.id;

    if (targetUserId !== session.user.id) {
      // Quelqu'un essaie de créer un événement pour un autre utilisateur
      if (session.user.role === 'ADMIN') {
        // Admin peut créer pour n'importe qui
      } else if (session.user.role === 'REFERENT') {
        // Référent peut créer pour SES vendeurs OU pour des admins OU pour d'autres référents
        const targetUser = await prisma.user.findUnique({
          where: { id: targetUserId },
          select: {
            id: true,
            role: true,
            referentId: true
          }
        });

        if (!targetUser) {
          return NextResponse.json(
            { error: 'Utilisateur cible non trouvé' },
            { status: 404 }
          );
        }

        const canAssign =
          targetUser.role === 'ADMIN' ||
          targetUser.role === 'REFERENT' ||
          (targetUser.role === 'VENDEUR' && targetUser.referentId === session.user.id);

        if (!canAssign) {
          return NextResponse.json(
            { error: 'Vous ne pouvez créer des événements que pour vos vendeurs, les admins ou les référents' },
            { status: 403 }
          );
        }
      } else {
        // Vendeur ne peut créer que pour lui-même
        return NextResponse.json(
          { error: 'Vous ne pouvez créer des événements que pour vous-même' },
          { status: 403 }
        );
      }
    }

    // Vérifier les chevauchements de créneaux
    const newStartTime = new Date(startTime);
    const newEndTime = new Date(endTime);

    const existingEvent = await prisma.calendarEvent.findFirst({
      where: {
        userId: targetUserId,
        AND: [
          { startTime: { lt: newEndTime } },
          { endTime: { gt: newStartTime } }
        ]
      },
      select: {
        title: true,
        startTime: true,
        endTime: true
      }
    });

    if (existingEvent) {
      const conflictStart = new Date(existingEvent.startTime).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
      });
      const conflictEnd = new Date(existingEvent.endTime).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
      });

      return NextResponse.json(
        {
          error: `Créneau déjà réservé. Un événement "${existingEvent.title}" est déjà programmé de ${conflictStart} à ${conflictEnd}.`
        },
        { status: 409 }
      );
    }

    const event = await prisma.calendarEvent.create({
      data: {
        userId: targetUserId,
        title,
        description: description || null,
        eventType,
        color: color || '#3b82f6',
        startTime: newStartTime,
        endTime: newEndTime,
        isAllDay: isAllDay || false,
        attendeeIds: attendeeIds || '[]'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
            courtierNumber: true
          }
        }
      }
    });

    // Créer des notifications
    const notifications = [];

    // Notification pour le propriétaire de l'événement (si créé par quelqu'un d'autre)
    if (targetUserId !== session.user.id) {
      const creator = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true, firstName: true, lastName: true }
      });

      const creatorName = creator?.firstName && creator?.lastName
        ? `${creator.firstName} ${creator.lastName}`
        : creator?.email || 'Un utilisateur';

      notifications.push({
        userId: targetUserId,
        kind: 'EVENT_ASSIGNED',
        entityId: event.id,
        metadata: JSON.stringify({
          eventId: event.id,
          eventTitle: title,
          eventType,
          startTime,
          endTime,
          creatorId: session.user.id,
          creatorName
        })
      });
    }

    // Notifications pour tous les participants
    if (attendeeIds && attendeeIds !== '[]') {
      try {
        const participantIds = JSON.parse(attendeeIds);
        const creator = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { email: true, firstName: true, lastName: true }
        });

        const creatorName = creator?.firstName && creator?.lastName
          ? `${creator.firstName} ${creator.lastName}`
          : creator?.email || 'Un utilisateur';

        for (const participantId of participantIds) {
          // Ne pas notifier le créateur s'il est dans les participants
          if (participantId !== session.user.id) {
            notifications.push({
              userId: participantId,
              kind: 'EVENT_PARTICIPANT',
              entityId: event.id,
              metadata: JSON.stringify({
                eventId: event.id,
                eventTitle: title,
                eventType,
                startTime,
                endTime,
                creatorId: session.user.id,
                creatorName
              })
            });
          }
        }
      } catch (error) {
        console.error('Erreur lors du parsing des participants:', error);
      }
    }

    // Créer toutes les notifications en une fois
    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications
      });
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
