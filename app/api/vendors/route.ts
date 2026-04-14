import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  // Seuls l'admin et le back-office peuvent créer des vendeurs
  // Les référents doivent maintenant faire une demande d'intégration
  if (session.user.role !== 'ADMIN' && session.user.role !==) {
    return NextResponse.json({ error: 'Non autorisé. Veuillez faire une demande d\'intégration.' }, { status: 403 });
  }

  const body = await request.json();
  const { email, firstName, lastName, phone, password, avatar, courtierNumber } = body;

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json(
      { error: 'Email, prénom, nom et mot de passe requis' },
      { status: 400 }
    );
  }

  if (!courtierNumber) {
    return NextResponse.json(
      { error: 'Numéro de courtier requis' },
      { status: 400 }
    );
  }

  // BLOQUER LES NUMÉROS 1-30 RÉSERVÉS AUX COURTIERS FICTIFS IA
  const courtierId = parseInt(courtierNumber);
  if (courtierId >= 1 && courtierId <= 30) {
    return NextResponse.json({
      error: '⛔ Les numéros 1-30 sont réservés au système. Veuillez choisir un numéro >= 31'
    }, { status: 400 });
  }

  try {
    // Vérifier si l'email existe déjà
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ error: 'Cet email existe déjà' }, { status: 400 });
    }

    // Vérifier si le numéro de courtier existe déjà
    const existingNumber = await prisma.user.findUnique({
      where: { courtierNumber: parseInt(courtierNumber) },
    });

    if (existingNumber) {
      return NextResponse.json({ error: 'Ce numéro de courtier est déjà utilisé' }, { status: 400 });
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // Créer le vendeur
    // Note: Le referentId doit être fourni explicitement par le back-office ou l'admin
    const vendor = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        phone: phone && phone.trim() !== '' ? phone : null,
        avatar: avatar || null,
        passwordHash,
        role: 'VENDEUR',
        courtierNumber: parseInt(courtierNumber),
        referentId: body.referentId || null,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, vendor });
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
