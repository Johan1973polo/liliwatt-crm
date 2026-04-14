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
  const { email, phone, password } = body;

  if (!email || !phone || !password) {
    return NextResponse.json(
      { error: 'Email, téléphone et mot de passe requis' },
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

    // Créer le référent
    const referent = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        role: 'REFERENT',
        isActive: true,
      },
    });

    // Créer automatiquement les 2 liens par défaut pour le référent
    await prisma.link.createMany({
      data: [
        {
          scope: 'USER',
          userId: referent.id,
          title: 'LILIWATT APP',
          url: 'https://liliwatt-app.onrender.com/',
          order: 0,
        },
        {
          scope: 'USER',
          userId: referent.id,
          title: 'LILIWATT FACTURATION',
          url: 'https://dashing-croissant-127a00.netlify.app/',
          order: 1,
        },
      ],
    });

    return NextResponse.json({ success: true, referent });
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
