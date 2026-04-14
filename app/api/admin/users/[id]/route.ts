import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// PUT /api/admin/users/[id] - Modifier un administrateur
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Vérification: seuls les admins peuvent modifier
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const adminId = params.id;
    const body = await request.json();
    const { email, phone, specialty, avatar, password } = body;

    // Vérifier que l'utilisateur existe et est bien un admin
    const adminToUpdate = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!adminToUpdate) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    if (adminToUpdate.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Cet utilisateur n\'est pas un administrateur' },
        { status: 400 }
      );
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== adminToUpdate.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé' },
          { status: 400 }
        );
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {};

    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone || null;
    if (specialty !== undefined) updateData.specialty = specialty || null;
    if (avatar !== undefined) updateData.avatar = avatar || null;

    // Si un nouveau mot de passe est fourni
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.passwordHash = hashedPassword;
    }

    // Mettre à jour l'admin
    const updatedAdmin = await prisma.user.update({
      where: { id: adminId },
      data: updateData,
      select: {
        id: true,
        email: true,
        phone: true,
        specialty: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Administrateur modifié avec succès',
      admin: updatedAdmin,
    });
  } catch (error) {
    console.error('Erreur lors de la modification de l\'admin:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Supprimer un administrateur
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Vérification: seuls les admins peuvent supprimer
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const adminId = params.id;

    // Vérifier que l'utilisateur existe et est bien un admin
    const adminToDelete = await prisma.user.findUnique({
      where: { id: adminId },
      include: {
        vendeurs: true, // Vérifier s'il a des vendeurs assignés
      },
    });

    if (!adminToDelete) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    if (adminToDelete.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Cet utilisateur n\'est pas un administrateur' },
        { status: 400 }
      );
    }

    // Empêcher de se supprimer soi-même
    if (adminToDelete.id === session.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 }
      );
    }

    // Vérifier s'il a des vendeurs assignés (si c'est un référent)
    if (adminToDelete.vendeurs && adminToDelete.vendeurs.length > 0) {
      return NextResponse.json(
        {
          error: 'Cet administrateur est référent de vendeurs. Réassignez-les avant de le supprimer.',
          vendorsCount: adminToDelete.vendeurs.length,
        },
        { status: 400 }
      );
    }

    // Supprimer l'admin
    // Grâce aux cascades dans Prisma, toutes les relations seront automatiquement supprimées :
    // - credentials, personalLinks, sentMessages, receivedMessages, requests, etc.
    await prisma.user.delete({
      where: { id: adminId },
    });

    return NextResponse.json({
      success: true,
      message: 'Administrateur supprimé avec succès. L\'adresse email est maintenant disponible.',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'admin:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
