import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT - Modifier un événement existant
export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { eventId } = params;
    const body = await request.json();

    // Récupérer l'événement existant
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id: eventId },
      include: {
        user: {
          select: {
            id: true,
            referentId: true,
            role: true,
          },
        },
      },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // Vérifier les permissions
    const canEdit = await canUserEditEvent(
      session.user.id,
      session.user.role,
      existingEvent.userId,
      existingEvent.user.referentId
    );

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission de modifier cet événement' },
        { status: 403 }
      );
    }

    // Mettre à jour l'événement
    const {
      title,
      description,
      eventType,
      color,
      startTime,
      endTime,
      isAllDay,
      attendeeIds,
    } = body;

    // Vérifier les chevauchements si les horaires changent
    if (startTime !== undefined && endTime !== undefined) {
      const newStartTime = new Date(startTime);
      const newEndTime = new Date(endTime);

      const conflictingEvent = await prisma.calendarEvent.findFirst({
        where: {
          userId: existingEvent.userId,
          id: { not: eventId }, // Exclure l'événement en cours de modification
          AND: [
            { startTime: { lt: newEndTime } },
            { endTime: { gt: newStartTime } }
          ]
        },
        select: {
          title: true,
          startTime: true,
          endTime: true,
        }
      });

      if (conflictingEvent) {
        const conflictStart = new Date(conflictingEvent.startTime).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'UTC'
        });
        const conflictEnd = new Date(conflictingEvent.endTime).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'UTC'
        });

        return NextResponse.json(
          {
            error: `Créneau déjà réservé. Un événement "${conflictingEvent.title}" est déjà programmé de ${conflictStart} à ${conflictEnd}.`
          },
          { status: 409 }
        );
      }
    }

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(eventType !== undefined && { eventType }),
        ...(color !== undefined && { color }),
        ...(startTime !== undefined && { startTime: new Date(startTime) }),
        ...(endTime !== undefined && { endTime: new Date(endTime) }),
        ...(isAllDay !== undefined && { isAllDay }),
        ...(attendeeIds !== undefined && { attendeeIds }),
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
            courtierNumber: true,
          },
        },
      },
    });

    // Créer des notifications si les participants ont changé
    if (attendeeIds !== undefined) {
      const oldAttendeeIds = JSON.parse(existingEvent.attendeeIds || '[]');
      const newAttendeeIds = JSON.parse(attendeeIds || '[]');

      // Trouver les nouveaux participants
      const addedParticipants = newAttendeeIds.filter((id: string) => !oldAttendeeIds.includes(id));

      if (addedParticipants.length > 0) {
        const editor = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { email: true, firstName: true, lastName: true },
        });

        const editorName = editor?.firstName && editor?.lastName
          ? `${editor.firstName} ${editor.lastName}`
          : editor?.email || 'Un utilisateur';

        const notifications = addedParticipants
          .filter((participantId: string) => participantId !== session.user.id)
          .map((participantId: string) => ({
            userId: participantId,
            kind: 'EVENT_PARTICIPANT',
            entityId: eventId,
            metadata: JSON.stringify({
              eventId: eventId,
              eventTitle: updatedEvent.title,
              eventType: updatedEvent.eventType,
              startTime: updatedEvent.startTime,
              endTime: updatedEvent.endTime,
              editorId: session.user.id,
              editorName,
            }),
          }));

        if (notifications.length > 0) {
          await prisma.notification.createMany({
            data: notifications,
          });
        }
      }
    }

    return NextResponse.json({ event: updatedEvent });
  } catch (error) {
    console.error('Erreur lors de la modification de l\'événement:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer un événement
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { eventId } = params;

    // Récupérer l'événement existant
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id: eventId },
      include: {
        user: {
          select: {
            id: true,
            referentId: true,
            role: true,
          },
        },
      },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // Vérifier les permissions
    const canEdit = await canUserEditEvent(
      session.user.id,
      session.user.role,
      existingEvent.userId,
      existingEvent.user.referentId
    );

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission de supprimer cet événement' },
        { status: 403 }
      );
    }

    // Supprimer l'événement
    await prisma.calendarEvent.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Fonction utilitaire pour vérifier les permissions d'édition
async function canUserEditEvent(
  currentUserId: string,
  currentUserRole: string,
  eventOwnerId: string,
  eventOwnerReferentId: string | null
): Promise<boolean> {
  // Admin peut tout modifier
  if (currentUserRole === 'ADMIN') {
    return true;
  }

  // L'utilisateur peut modifier ses propres événements
  if (currentUserId === eventOwnerId) {
    return true;
  }

  // Référent peut modifier les événements de SES vendeurs, des admins et d'autres référents
  if (currentUserRole === 'REFERENT') {
    // Récupérer l'utilisateur cible
    const targetUser = await prisma.user.findUnique({
      where: { id: eventOwnerId },
      select: {
        role: true,
        referentId: true,
      },
    });

    if (!targetUser) return false;

    // Référent peut modifier événements de: ses vendeurs, admins, autres référents
    const canEdit =
      targetUser.role === 'ADMIN' ||
      targetUser.role === 'REFERENT' ||
      (targetUser.role === 'VENDEUR' && targetUser.referentId === currentUserId);

    return canEdit;
  }

  // Sinon, pas de permission
  return false;
}
