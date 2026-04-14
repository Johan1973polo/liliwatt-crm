import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const body = await request.json();
  const { email, password, phone, avatar } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email et mot de passe requis' },
      { status: 400 }
    );
  }

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // Créer l'utilisateur back-office
    const backOfficeUser = await prisma.user.create({
      data: {
        email,
        phone: phone || null,
        avatar: avatar || null,
        passwordHash,
        role:,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: backOfficeUser.id,
        email: backOfficeUser.email,
        role: backOfficeUser.role,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la création du compte back-office:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
