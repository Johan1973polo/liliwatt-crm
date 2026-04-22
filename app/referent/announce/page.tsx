import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import ReferentAnnounceClient from './ReferentAnnounceClient';

export const revalidate = 0;

export default async function ReferentAnnouncePage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'REFERENT') redirect('/auth/signin');

  const referent = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, email: true, role: true, avatar: true, firstName: true, lastName: true, linkVisio: true,
      vendeurs: { where: { isActive: true }, select: { id: true, firstName: true } },
    },
  });
  if (!referent) redirect('/auth/signin');

  return (
    <>
      <Navbar userEmail={referent.email} userRole={referent.role} userAvatar={referent.avatar} />
      <div className="container py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-megaphone me-2"></i>
            Annoncer a mon equipe
          </h1>
          <p className="text-muted mb-0">
            Envoyez une annonce ou planifiez un briefing pour vos {referent.vendeurs.length} vendeur{referent.vendeurs.length > 1 ? 's' : ''}
          </p>
        </div>
        <ReferentAnnounceClient
          vendeurCount={referent.vendeurs.length}
          referentName={`${referent.firstName || ''} ${referent.lastName || ''}`}
          hasVisio={!!referent.linkVisio}
        />
      </div>
    </>
  );
}
