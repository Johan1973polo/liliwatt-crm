import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import AnnoncesClient from './AnnoncesClient';

export const revalidate = 0;

export default async function AnnoncesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'VENDEUR') redirect('/auth/signin');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true, avatar: true, referentId: true },
  });
  if (!user?.referentId) redirect('/vendeur');

  const announcements = await prisma.referentAnnouncement.findMany({
    where: { referentId: user.referentId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      referent: { select: { firstName: true, lastName: true } },
      reads: { where: { userId: user.id }, select: { readAt: true } },
    },
  });

  const unreadCount = announcements.filter(a => a.reads.length === 0).length;

  return (
    <>
      <Navbar userEmail={user.email} userRole={user.role} userAvatar={user.avatar} />
      <div className="container-fluid px-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h4 className="mb-0">
                <i className="bi bi-megaphone me-2"></i>
                Annonces de mon referent
              </h4>
              {unreadCount > 0 && (
                <span className="badge bg-warning text-dark">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>
              )}
            </div>
            <AnnoncesClient announcements={JSON.parse(JSON.stringify(announcements))} />
          </div>
        </div>
      </div>
    </>
  );
}
