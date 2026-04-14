import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const linkId = params.id;

  try {
    const link = await prisma.link.findUnique({
      where: { id: linkId },
    });

    if (!link) {
      return NextResponse.json({ error: 'Lien non trouvé' }, { status: 404 });
    }

    // Vérifier les permissions
    if (link.scope === 'GLOBAL' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    if (
      link.scope === 'TEAM' &&
      session.user.role !== 'ADMIN' &&
      link.teamReferentId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    await prisma.link.delete({
      where: { id: linkId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
