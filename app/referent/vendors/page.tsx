import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import VendeursTableau from '../VendeursTableau';
import AutoRefresh from '@/components/AutoRefresh';

export const revalidate = 0;

export default async function MesVendeursPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'REFERENT') redirect('/auth/signin');

  const vendeurs = await prisma.user.findMany({
    where: {
      role: 'VENDEUR',
      referentId: session.user.id,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      phone: true,
      createdAt: true,
      isActive: true,
      courtierNumber: true,
      avatar: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <AutoRefresh interval={10000} />
      <Navbar userEmail={session.user.email} userRole={session.user.role} userAvatar={session.user.avatar} />

      <div className="container-fluid py-4">
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{
            fontSize: '28px', fontWeight: 800, color: '#1e1b4b',
            letterSpacing: '-0.5px', margin: '0 0 6px',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <i className="bi bi-people-fill"></i> Mes Vendeurs
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            Vue d&apos;ensemble de votre equipe en temps reel — {vendeurs.length} vendeur{vendeurs.length > 1 ? 's' : ''} actif{vendeurs.length > 1 ? 's' : ''}
          </p>
        </div>

        {vendeurs.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-5">
              <i className="bi bi-inbox display-1 text-muted"></i>
              <p className="text-muted mt-3 mb-0">Aucun vendeur actif dans votre equipe.</p>
            </div>
          </div>
        ) : (
          <VendeursTableau vendeurs={vendeurs} />
        )}
      </div>
    </>
  );
}
