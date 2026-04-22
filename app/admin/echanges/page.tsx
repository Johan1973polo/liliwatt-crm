import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import ExchangesViewer from './ExchangesViewer';

export default async function AdminExchangesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  return (
    <>
      <Navbar
        userEmail={session.user.email}
        userRole={session.user.role}
        userAvatar={session.user.avatar}
      />

      <div className="container-fluid py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-eye me-2"></i>
            Consultation des Echanges
          </h1>
          <p className="text-muted mb-0">
            Visualisation en lecture seule des conversations entre utilisateurs
          </p>
        </div>

        <ExchangesViewer />
      </div>
    </>
  );
}
