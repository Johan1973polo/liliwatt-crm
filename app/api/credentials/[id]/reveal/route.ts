import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { decryptPassword } from '@/lib/crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const credentialId = params.id;

  try {
    const credential = await prisma.credential.findUnique({
      where: { id: credentialId },
      include: { user: true },
    });

    if (!credential) {
      return NextResponse.json({ error: 'Identifiant non trouvé' }, { status: 404 });
    }

    // Vérifier les permissions
    const canAccess =
      session.user.role === 'ADMIN' ||
      session.user.role === ||
      credential.userId === session.user.id || // Peut révéler ses propres credentials
      (session.user.role === 'REFERENT' &&
        credential.user.role === 'VENDEUR' &&
        credential.user.referentId === session.user.id); // Référent peut révéler les credentials de ses vendeurs

    if (!canAccess) {
      console.error('Accès refusé:', {
        sessionRole: session.user.role,
        sessionUserId: session.user.id,
        credentialUserId: credential.userId,
        credentialUserRole: credential.user.role,
        credentialUserReferentId: credential.user.referentId,
      });
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Déchiffrer le mot de passe
    const password = decryptPassword(credential.passwordEncrypted);

    return NextResponse.json({ password });
  } catch (error) {
    console.error('Erreur lors de la révélation du mot de passe:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
