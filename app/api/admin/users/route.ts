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
  const { email, password, phone, avatar, specialty } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email et mot de passe requis' },
      { status: 400 }
    );
  }

  try {
    // Vérifier si l'email existe déjà
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ error: 'Cet email existe déjà' }, { status: 400 });
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // Créer l'admin
    const admin = await prisma.user.create({
      data: {
        email,
        phone: phone && phone.trim() !== '' ? phone : null,
        avatar: avatar || null,
        specialty: specialty && specialty.trim() !== '' ? specialty : null,
        passwordHash,
        role: 'ADMIN',
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, admin });
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
