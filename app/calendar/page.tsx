import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import CalendarInterface from './CalendarInterface';

export const revalidate = 0;

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Déterminer quels agendas l'utilisateur peut voir
  let viewableUsers: any[] = [];
  let canEdit = true; // Par défaut, l'utilisateur peut éditer

  if (session.user.role === 'ADMIN') {
    // Admin voit tous les utilisateurs (sauf back-office)
    viewableUsers = await prisma.user.findMany({
      where: {
        role: {
          not:,
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        courtierNumber: true,
      },
      orderBy: [
        { role: 'asc' },
        { email: 'asc' },
      ],
    });
  ,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        courtierNumber: true,
      },
      orderBy: [
        { role: 'asc' },
        { email: 'asc' },
      ],
    });
  } else if (session.user.role === 'REFERENT') {
    // Référent voit: lui-même + ses vendeurs + les admins + les autres référents
    const referentVendeurs = await prisma.user.findMany({
      where: {
        role: 'VENDEUR',
        referentId: session.user.id,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        courtierNumber: true,
      },
      orderBy: { email: 'asc' },
    });

    const referentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        courtierNumber: true,
      },
    });

    // Récupérer tous les admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        courtierNumber: true,
      },
      orderBy: { email: 'asc' },
    });

    // Récupérer tous les autres référents
    const otherReferents = await prisma.user.findMany({
      where: {
        role: 'REFERENT',
        id: { not: session.user.id },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        courtierNumber: true,
      },
      orderBy: { email: 'asc' },
    });

    viewableUsers = [
      ...(referentUser ? [referentUser] : []),
      ...referentVendeurs,
      ...admins,
      ...otherReferents,
    ];
  } else if (session.user.role === 'VENDEUR') {
    // Vendeur voit: lui-même + son référent
    const vendeur = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        courtierNumber: true,
        referentId: true,
      },
    });

    const users = [vendeur];

    if (vendeur?.referentId) {
      const referent = await prisma.user.findUnique({
        where: { id: vendeur.referentId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          avatar: true,
          courtierNumber: true,
          referentId: true,
        },
      });
      if (referent) {
        users.push(referent);
      }
    }

    viewableUsers = users.filter(Boolean);
  }

  // Récupérer les notifications non lues (SAUF performances)
  const unreadCount = await prisma.notification.count({
    where: {
      userId: session.user.id,
      isRead: false,
      kind: 'MESSAGE',
    },
  });

  // Compter les notifications de performances non lues
  const performancesActivityCount = await prisma.notification.count({
    where: {
      userId: session.user.id,
      kind: { in: ['SALE_MADE', 'INVOICE_RECEIVED'] },
      isRead: false,
    },
  });

  return (
    <>
      <Navbar
        userEmail={session.user.email}
        userRole={session.user.role}
        userAvatar={session.user.avatar}
        notificationCount={unreadCount}
        performancesActivityCount={performancesActivityCount}
      />

      <div className="container-fluid py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-calendar-week me-2"></i>
            Agenda
          </h1>
          <p className="text-muted mb-0">
            Planifiez vos rendez-vous et gérez vos disponibilités
          </p>
        </div>

        <CalendarInterface
          currentUserId={session.user.id}
          currentUserRole={session.user.role}
          viewableUsers={viewableUsers}
          canEdit={canEdit}
        />
      </div>
    </>
  );
}
