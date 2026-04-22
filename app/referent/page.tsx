import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import VendeurIdentifiants from '../vendeur/VendeurIdentifiants';
import LinksBlock from '../vendeur/LinksBlock';
import QuickAccessCards from '../vendeur/QuickAccessCards';
import MarchesEnergie from '@/components/MarchesEnergie';
import DeclarationButtons from '../vendeur/DeclarationButtons';
import AutoRefresh from '@/components/AutoRefresh';

export const revalidate = 0;

export default async function ReferentPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'REFERENT') {
    redirect('/auth/signin');
  }

  const userId = session.user.id;

  // Liens personnels du referent
  const personalLinks = await prisma.link.findMany({
    where: { scope: 'USER', userId },
    orderBy: { order: 'asc' },
  });

  // Compter les vendeurs actifs (pour le widget)
  const vendeurCount = await prisma.user.count({
    where: { role: 'VENDEUR', referentId: userId, isActive: true },
  });

  return (
    <>
      <AutoRefresh interval={10000} />
      <Navbar
        userEmail={session.user.email}
        userRole={session.user.role}
        userAvatar={session.user.avatar}
      />

      <div className="container-fluid py-4">
        {/* Acces rapides */}
        <QuickAccessCards />

        <MarchesEnergie />

        {/* Annonces a l equipe */}
        <DeclarationButtons />

        {/* Widget Mon equipe */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          marginBottom: '24px',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <div style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '2px',
              textTransform: 'uppercase', opacity: 0.7, marginBottom: '6px',
            }}>
              Mon equipe
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>
              Piloter mes vendeurs
            </div>
            <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>
              {vendeurCount} vendeur{vendeurCount > 1 ? 's' : ''} actif{vendeurCount > 1 ? 's' : ''} — statut en ligne, coordonnees, acces rapide aux profils
            </div>
          </div>
          <Link
            href="/referent/vendors"
            style={{
              background: 'white', color: '#7c3aed', padding: '14px 28px',
              borderRadius: '12px', textDecoration: 'none', fontWeight: 700,
              fontSize: '14px', letterSpacing: '0.5px',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            Voir mon equipe <span style={{ fontSize: '18px' }}>→</span>
          </Link>
        </div>

        {/* Liens et Identifiants */}
        <div className="row mb-4">
          <div className="col-md-6">
            <LinksBlock links={personalLinks} />
          </div>
          <div className="col-md-6">
            <VendeurIdentifiants />
          </div>
        </div>
      </div>
    </>
  );
}
