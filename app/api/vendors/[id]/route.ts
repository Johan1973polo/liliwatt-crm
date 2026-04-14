import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { encryptPassword } from '@/lib/crypto';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const vendorId = params.id;
  const body = await request.json();

  // Vérifier les permissions
  if (session.user.role === 'ADMIN') {
    // Admin peut tout modifier
  } else if (session.user.role === 'REFERENT') {
    // Référent peut modifier uniquement ses vendeurs
    const vendor = await prisma.user.findUnique({
      where: { id: vendorId },
      select: { referentId: true, role: true },
    });

    if (!vendor || vendor.role !== 'VENDEUR' || vendor.referentId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }
  } else {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    // Mettre à jour l'avatar si fourni
    if (body.avatar !== undefined) {
      await prisma.user.update({
        where: { id: vendorId },
        data: { avatar: body.avatar || null },
      });
    }

    // Supprimer les anciens identifiants pour les recréer
    await prisma.credential.deleteMany({
      where: { userId: vendorId },
    });

    // Créer les nouveaux identifiants
    if (body.credentials && body.credentials.length > 0) {
      await prisma.credential.createMany({
        data: body.credentials.map((cred: any) => ({
          userId: vendorId,
          serviceName: cred.serviceName,
          login: cred.login,
          passwordEncrypted: encryptPassword(cred.password || 'EN ATTENTE'),
        })),
      });
    }

    // Les admins et le back-office peuvent modifier les liens personnels
    if (session.user.role === 'ADMIN') {
      // Supprimer les anciens liens pour les recréer
      await prisma.link.deleteMany({
        where: { userId: vendorId, scope: 'USER' },
      });

      // Créer les nouveaux liens
      if (body.links && body.links.length > 0) {
        await prisma.link.createMany({
          data: body.links.map((link: any, index: number) => ({
            scope: 'USER',
            userId: vendorId,
            title: link.title,
            url: link.url,
            order: index,
          })),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const vendorId = params.id;

  // Vérifier les permissions
  if (session.user.role === 'ADMIN') {
    // Admin peut tout supprimer
  } else if (session.user.role === 'REFERENT') {
    // Référent peut supprimer uniquement ses vendeurs
    const vendor = await prisma.user.findUnique({
      where: { id: vendorId },
      select: { referentId: true, role: true },
    });

    if (!vendor || vendor.role !== 'VENDEUR' || vendor.referentId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }
  } else {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    await prisma.user.delete({
      where: { id: vendorId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
