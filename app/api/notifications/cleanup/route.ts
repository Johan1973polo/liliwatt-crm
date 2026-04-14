import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/notifications/cleanup - Nettoyer les notifications orphelines
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Seuls les admins peuvent nettoyer
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    let deletedCount = 0;

    // 1. Récupérer toutes les notifications MESSAGE
    const messageNotifications = await prisma.notification.findMany({
      where: { kind: 'MESSAGE' },
      select: { id: true, entityId: true },
    });

    // Vérifier quelles notifications MESSAGE sont orphelines
    const orphanedMessageNotificationIds: string[] = [];
    for (const notif of messageNotifications) {
      const messageExists = await prisma.message.findUnique({
        where: { id: notif.entityId },
      });
      if (!messageExists) {
        orphanedMessageNotificationIds.push(notif.id);
      }
    }

    // Supprimer les notifications MESSAGE orphelines
    if (orphanedMessageNotificationIds.length > 0) {
      const result = await prisma.notification.deleteMany({
        where: { id: { in: orphanedMessageNotificationIds } },
      });
      deletedCount += result.count;
    }

    // 2. Récupérer toutes les notifications REQUEST
    const requestNotifications = await prisma.notification.findMany({
      where: { kind: 'REQUEST' },
      select: { id: true, entityId: true },
    });

    // Vérifier quelles notifications REQUEST sont orphelines
    const orphanedRequestNotificationIds: string[] = [];
    for (const notif of requestNotifications) {
      const requestExists = await prisma.request.findUnique({
        where: { id: notif.entityId },
      });
      if (!requestExists) {
        orphanedRequestNotificationIds.push(notif.id);
      }
    }

    // Supprimer les notifications REQUEST orphelines
    if (orphanedRequestNotificationIds.length > 0) {
      const result = await prisma.notification.deleteMany({
        where: { id: { in: orphanedRequestNotificationIds } },
      });
      deletedCount += result.count;
    }

    // 3. Supprimer les notifications dont l'utilisateur n'existe plus
    const userNotifications = await prisma.notification.findMany({
      select: { id: true, userId: true },
    });

    const orphanedUserNotificationIds: string[] = [];
    for (const notif of userNotifications) {
      const userExists = await prisma.user.findUnique({
        where: { id: notif.userId },
      });
      if (!userExists) {
        orphanedUserNotificationIds.push(notif.id);
      }
    }

    // Supprimer les notifications d'utilisateurs supprimés
    if (orphanedUserNotificationIds.length > 0) {
      const result = await prisma.notification.deleteMany({
        where: { id: { in: orphanedUserNotificationIds } },
      });
      deletedCount += result.count;
    }

    return NextResponse.json({
      success: true,
      message: `${deletedCount} notification(s) orpheline(s) supprimée(s)`,
      details: {
        messageNotifications: orphanedMessageNotificationIds.length,
        requestNotifications: orphanedRequestNotificationIds.length,
        userNotifications: orphanedUserNotificationIds.length,
      },
    });
  } catch (error) {
    console.error('Erreur lors du nettoyage des notifications:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
