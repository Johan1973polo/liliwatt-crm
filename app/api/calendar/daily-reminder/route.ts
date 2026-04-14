import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Cron job pour envoyer les rappels quotidiens d'événements
export async function GET(request: NextRequest) {
  try {
    // Vérifier le secret pour sécuriser l'endpoint
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Définir la plage du jour (00:00 à 23:59)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Récupérer tous les événements du jour
    const todayEvents = await prisma.calendarEvent.findMany({
      where: {
        startTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Grouper les événements par utilisateur
    const eventsByUser = new Map<string, typeof todayEvents>();

    for (const event of todayEvents) {
      const userId = event.userId;
      if (!eventsByUser.has(userId)) {
        eventsByUser.set(userId, []);
      }
      eventsByUser.get(userId)!.push(event);
    }

    // Créer une notification pour chaque utilisateur ayant des événements aujourd'hui
    let notificationsCreated = 0;

    for (const [userId, userEvents] of eventsByUser.entries()) {
      // Vérifier si une notification similaire n'existe pas déjà aujourd'hui
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId,
          kind: 'CALENDAR_REMINDER',
          createdAt: {
            gte: today,
          },
        },
      });

      // Ne créer une notification que si elle n'existe pas déjà
      if (!existingNotification) {
        const eventCount = userEvents.length;
        const firstEventTime = new Date(userEvents[0].startTime).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        });

        const metadata = JSON.stringify({
          eventCount,
          firstEventTime,
          date: today.toISOString(),
        });

        await prisma.notification.create({
          data: {
            userId,
            kind: 'CALENDAR_REMINDER',
            entityId: 'today', // Identifiant spécial pour les rappels quotidiens
            isRead: false,
            metadata,
          },
        });

        notificationsCreated++;
      }
    }

    return NextResponse.json({
      success: true,
      date: today.toISOString(),
      eventsFound: todayEvents.length,
      usersNotified: eventsByUser.size,
      notificationsCreated,
    });
  } catch (error) {
    console.error('Erreur lors du rappel quotidien:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
