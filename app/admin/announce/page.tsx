import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import BroadcastForm from './BroadcastForm';

export default async function AdminAnnouncePage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  return (
    <>
      <Navbar userEmail={session.user.email} userRole={session.user.role} userAvatar={session.user.avatar} />

      <div className="container py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-megaphone me-2"></i>
            Annoncer à l&apos;équipe
          </h1>
          <p className="text-muted mb-0">
            Envoyez un message à toute l&apos;équipe, aux référents ou aux vendeurs
          </p>
        </div>

        <BroadcastForm />
      </div>
    </>
  );
}
