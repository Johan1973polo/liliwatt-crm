import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { encryptPassword } from '@/lib/crypto';
import bcrypt from 'bcryptjs';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const backofficeId = params.id;
  const body = await request.json();

  try {
    // Mettre à jour l'avatar si fourni
    if (body.avatar !== undefined) {
      await prisma.user.update({
        where: { id: backofficeId },
        data: { avatar: body.avatar || null },
      });
    }

    // Supprimer les anciens identifiants pour les recréer
    await prisma.credential.deleteMany({
      where: { userId: backofficeId },
    });

    // Créer les nouveaux identifiants
    if (body.credentials && body.credentials.length > 0) {
      await prisma.credential.createMany({
        data: body.credentials.map((cred: any) => ({
          userId: backofficeId,
          serviceName: cred.serviceName,
          login: cred.login,
          passwordEncrypted: encryptPassword(cred.password || 'EN ATTENTE'),
        })),
      });
    }

    // Supprimer les anciens liens pour les recréer
    await prisma.link.deleteMany({
      where: { userId: backofficeId, scope: 'USER' },
    });

    // Créer les nouveaux liens
    if (body.links && body.links.length > 0) {
      await prisma.link.createMany({
        data: body.links.map((link: any, index: number) => ({
          scope: 'USER',
          userId: backofficeId,
          title: link.title,
          url: link.url,
          order: index,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const backofficeId = params.id;
  const body = await request.json();
  const { email, phone, avatar, newPassword } = body;

  try {
    // Vérifier si l'email existe déjà pour un autre utilisateur
    if (email) {
      const existing = await prisma.user.findFirst({
        where: {
          email,
          id: { not: backofficeId },
        },
      });

      if (existing) {
        return NextResponse.json({ error: 'Cet email existe déjà' }, { status: 400 });
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      email,
      phone,
      avatar,
    };

    // Si un nouveau mot de passe est fourni, le hasher
    if (newPassword && newPassword.trim() !== '') {
      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    // Mettre à jour le back-office
    const updatedBackoffice = await prisma.user.update({
      where: { id: backofficeId },
      data: updateData,
    });

    return NextResponse.json({ success: true, backoffice: updatedBackoffice });
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

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const backofficeId = params.id;

  try {
    // Supprimer l'utilisateur back-office
    await prisma.user.delete({
      where: { id: backofficeId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
